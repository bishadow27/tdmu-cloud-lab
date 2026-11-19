require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db');

const PORT = Number(process.env.PORT) || 3000;

connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log('API dang chay tai cong ' + PORT)))
  .catch((err) => {
    console.error('Khong ket noi duoc MongoDB:', err.message);
    process.exitCode = 1;
  });
