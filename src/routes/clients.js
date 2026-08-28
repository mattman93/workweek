const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { geocodeAddress } = require('../geocode');

const router = express.Router();
router.use(requireLogin);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value) {
  return typeof value === 'string' && DATE_RE.test(value) ? value : null;
}

router.get('/', (req, res) => {
  const clients = db
    .prepare('SELECT * FROM clients WHERE business_id = ? ORDER BY name')
    .all(req.session.businessId);
  res.render('clients', { clients, error: null });
});

router.post('/', async (req, res) => {
  const { name, phone, email, address, next_service_date } = req.body;

  if (!name || !address) {
    const clients = db
      .prepare('SELECT * FROM clients WHERE business_id = ? ORDER BY name')
      .all(req.session.businessId);
    return res.render('clients', { clients, error: 'Client name and address are required.' });
  }

  const coords = await geocodeAddress(address);

  db.prepare(
    'INSERT INTO clients (business_id, name, phone, email, address, lat, lng, next_service_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    req.session.businessId,
    name,
    phone || null,
    email || null,
    address,
    coords ? coords.lat : null,
    coords ? coords.lng : null,
    normalizeDate(next_service_date)
  );

  res.redirect('/clients');
});

router.post('/:id/schedule', (req, res) => {
  db.prepare('UPDATE clients SET next_service_date = ? WHERE id = ? AND business_id = ?').run(
    normalizeDate(req.body.next_service_date),
    req.params.id,
    req.session.businessId
  );
  res.redirect('/clients');
});

router.post('/:id/delete', (req, res) => {
  db.prepare('DELETE FROM clients WHERE id = ? AND business_id = ?').run(
    req.params.id,
    req.session.businessId
  );
  res.redirect('/clients');
});

module.exports = router;
