const monk = require('monk');

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  console.error('[DB] FATAL: DB_URL environment variable is not set');
  process.exit(1);
}

const db = monk(dbUrl);

db.then(() => {
  console.log('[DB] Connected successfully');
}).catch((err) => {
  console.error(`[DB] Connection failed: ${err.message}`);
});

module.exports = db;
