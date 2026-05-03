require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'legal_ninja' });
    const counts = await mongoose.connection.db.collection('questions').aggregate([
      { $group: { _id: { subject: '$subject', track: '$track', difficulty: '$difficulty', approved: '$approved' }, count: { $sum: 1 } } }
    ]).toArray();
    console.log(JSON.stringify(counts, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
