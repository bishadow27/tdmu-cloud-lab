const express = require('express');
const notesRouter = require('./routes/notes');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// Route kiem tra tu Bai 1, giu API root don gian.
app.get('/', (req, res) => {
  res.json({ message: 'TDMU Cloud Lab API', status: 'ok' });
});
app.use('/notes', notesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Khong tim thay endpoint' });
});

// Express 5 tu dong chuyen loi tu route async vao middleware nay.
app.use((err, req, res, next) => {
  console.error(err);
  const clientError =
    ['ValidationError', 'CastError', 'MulterError', 'SyntaxError'].includes(err.name) ||
    (typeof err.status === 'number' && err.status >= 400 && err.status < 500) ||
    err.code === 'LIMIT_FILE_SIZE';
  res.status(clientError ? 400 : 500).json({
    error: clientError ? err.message : 'Loi may chu'
  });
});

module.exports = app;
