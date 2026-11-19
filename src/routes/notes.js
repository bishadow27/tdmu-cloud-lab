const express = require('express');
const multer = require('multer');
const { randomUUID } = require('node:crypto');
const Note = require('../models/note');
const { bucket } = require('../storage');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.get('/', async (req, res) => {
  const filter = req.query.tag ? { tags: String(req.query.tag) } : {};
  const notes = await Note.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(notes);
});

router.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Khong tim thay ghi chu' });
  res.json(note);
});

router.post('/', async (req, res) => {
  const { title, content, tags } = req.body ?? {};
  const note = await Note.create({ title, content, tags });
  res.status(201).json(note);
});

router.put('/:id', async (req, res) => {
  const { title, content, tags } = req.body ?? {};
  const update = {};
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;
  if (tags !== undefined) update.tags = tags;
  const note = await Note.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!note) return res.status(404).json({ error: 'Khong tim thay ghi chu' });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Khong tim thay ghi chu' });
  res.status(204).end();
});

router.post('/:id/attachment', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Thieu tep o truong "file"' });
  }

  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Khong tim thay ghi chu' });

  // Ten tep an toan; UUID tranh trung ten khi upload lien tiep.
  const safeName = String(req.file.originalname || 'attachment')
    .normalize('NFD')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .slice(0, 100) || 'attachment';
  const path = String(note._id) + '/' + randomUUID() + '-' + safeName;

  const storage = bucket();
  const { error } = await storage.upload(path, req.file.buffer, {
    contentType: req.file.mimetype || 'application/octet-stream',
    upsert: false
  });
  if (error) throw error;

  note.attachmentUrl = storage.getPublicUrl(path).data.publicUrl;
  try {
    await note.save();
  } catch (err) {
    // Neu luu MongoDB that bai, thu xoa tep de tranh tao tep mo coi.
    const cleanup = await storage.remove([path]);
    if (cleanup.error) console.error('Khong xoa duoc tep mo coi:', cleanup.error);
    throw err;
  }
  res.json(note);
});

module.exports = router;
