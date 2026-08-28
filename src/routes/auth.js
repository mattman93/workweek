const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup', { error: null, name: '', email: '' });
});

router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', { error: 'All fields are required.', name, email });
  }
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.', name, email });
  }

  const existing = db.prepare('SELECT id FROM businesses WHERE email = ?').get(email);
  if (existing) {
    return res.render('signup', { error: 'An account with that email already exists.', name, email });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO businesses (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);

  req.session.businessId = result.lastInsertRowid;
  req.session.businessName = name;
  res.redirect('/schedule');
});

router.get('/login', (req, res) => {
  res.render('login', { error: null, email: '' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const business = db.prepare('SELECT * FROM businesses WHERE email = ?').get(email);

  if (!business || !(await bcrypt.compare(password, business.password_hash))) {
    return res.render('login', { error: 'Invalid email or password.', email });
  }

  req.session.businessId = business.id;
  req.session.businessName = business.name;
  res.redirect('/schedule');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
