require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('../src/models/note');

const TAGS = ['cloud', 'docker', 'nosql', 'security', 'devops', 'java', 'web'];

async function main() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Thieu MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    // Chi xoa du lieu demo owner=seed, khong cham vao ghi chu that.
    const removed = await Note.deleteMany({ owner: 'seed' });
    const docs = Array.from({ length: 2000 }, (_, i) => ({
      title: 'Ghi chu mau ' + (i + 1),
      content: 'Du lieu thu nghiem',
      tags: [TAGS[i % 7], TAGS[(i * 3) % 7]],
      owner: 'seed'
    }));
    await Note.insertMany(docs);
    console.log('Da xoa ' + removed.deletedCount + ' ghi chu seed cu');
    console.log('Da chen ' + docs.length + ' ghi chu moi');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Seed that bai:', err.message);
  process.exitCode = 1;
});
