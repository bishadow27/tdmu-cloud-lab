require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('../src/models/note');

function stats(result) {
  const value = Array.isArray(result) ? result[0] : result;
  if (!value || !value.executionStats) {
    throw new Error('Khong doc duoc executionStats');
  }
  return value.executionStats;
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Thieu MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    // createIndexes khong xoa index khac, khac voi syncIndexes.
    await Note.createIndexes();
    const filter = { tags: 'docker' };

    const scan = stats(await Note.find(filter)
      .hint({ $natural: 1 }).explain('executionStats'));
    const idx = stats(await Note.find(filter)
      .hint({ tags: 1 }).explain('executionStats'));

    console.table({
      'Quet toan bo (COLLSCAN)': {
        docsExamined: scan.totalDocsExamined,
        returned: scan.nReturned,
        ms: scan.executionTimeMillis
      },
      'Dung chi muc (IXSCAN)': {
        docsExamined: idx.totalDocsExamined,
        returned: idx.nReturned,
        ms: idx.executionTimeMillis
      }
    });
    if (idx.totalDocsExamined > 0) {
      const ratio = scan.totalDocsExamined / idx.totalDocsExamined;
      console.log('Giam so tai lieu phai kiem tra: ' + ratio.toFixed(2) + ' lan');
    } else {
      console.log('Khong the chia ti so: docsExamined co chi muc = 0');
    }
    console.log('Luu y: ms tren tap nho khong du de ket luan toc do; uu tien docsExamined.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('Explain that bai:', err.message);
  process.exitCode = 1;
});
