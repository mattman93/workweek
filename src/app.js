require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const clientRoutes = require('./routes/clients');
const scheduleRoutes = require('./routes/schedule');
const routesPageRoutes = require('./routes/routesPage');
const revenueRoutes = require('./routes/revenue');
const messageRoutes = require('./routes/messages');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

app.use((req, res, next) => {
  res.locals.businessName = req.session.businessName || null;
  next();
});

app.get('/', (req, res) => {
  res.redirect(req.session.businessId ? '/schedule' : '/login');
});

app.use('/', authRoutes);

app.use('/employees', employeeRoutes);
app.use('/clients', clientRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/routes', routesPageRoutes);
app.use('/revenue', revenueRoutes);
app.use('/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).send('Not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Workweek running on http://localhost:${PORT}`);
});
