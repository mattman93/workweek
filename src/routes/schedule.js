const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', (req, res) => {
  const today = todayISO();

  const clients = db
    .prepare(
      'SELECT id, name, address, lat, lng, next_service_date FROM clients WHERE business_id = ? AND lat IS NOT NULL AND lng IS NOT NULL'
    )
    .all(req.session.businessId)
    .map((client) => ({ ...client, dueToday: client.next_service_date === today }));

  const missingCount = db
    .prepare(
      'SELECT COUNT(*) AS count FROM clients WHERE business_id = ? AND (lat IS NULL OR lng IS NULL)'
    )
    .get(req.session.businessId).count;

  const dueTodayCount = db
    .prepare('SELECT COUNT(*) AS count FROM clients WHERE business_id = ? AND next_service_date = ?')
    .get(req.session.businessId, today).count;

  res.render('schedule', { clients, missingCount, dueTodayCount });
});

module.exports = router;
