const express = require('express');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

router.get('/', (req, res) => {
  const employees = db
    .prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY name')
    .all(req.session.businessId);
  res.render('employees', { employees, error: null });
});

router.post('/', (req, res) => {
  const { name, email, phone, role } = req.body;
  if (!name) {
    const employees = db
      .prepare('SELECT * FROM employees WHERE business_id = ? ORDER BY name')
      .all(req.session.businessId);
    return res.render('employees', { employees, error: 'Employee name is required.' });
  }

  db.prepare(
    'INSERT INTO employees (business_id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)'
  ).run(req.session.businessId, name, email || null, phone || null, role || null);

  res.redirect('/employees');
});

router.post('/:id/delete', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ? AND business_id = ?').run(
    req.params.id,
    req.session.businessId
  );
  res.redirect('/employees');
});

module.exports = router;
