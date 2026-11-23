const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db.js');

const router = express.Router();

const TEAM_SIZES = ['1-10 people', '11-50 people', '51-200 people', '200+ people'];

function clean(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function isEmail(email) {
  return email.includes('@') && email.includes('.') && !email.includes(' ');
}

function emailTaken(email) {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (user) {
    return true;
  }
  return false;
}

function userInfo(user) {
  const company = db.prepare('SELECT name FROM companies WHERE id = ?').get(user.company_id);
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    isAdmin: user.is_admin === 1,
    company: company.name
  };
}

function signedIn(req, res, next) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Please sign in.' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!user) {
    res.status(401).json({ error: 'Please sign in.' });
    return;
  }
  req.user = user;
  next();
}

function adminOnly(req, res, next) {
  if (req.user.is_admin !== 1) {
    res.status(403).json({ error: 'Only the company admin can do this.' });
    return;
  }
  next();
}

router.post('/companies', function (req, res) {
  const companyName = clean(req.body.companyName);
  const name = clean(req.body.name);
  const teamSize = clean(req.body.teamSize);
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);

  if (companyName === '' || name === '') {
    res.status(400).json({ error: 'Enter your company name and your name.' });
    return;
  }
  if (!TEAM_SIZES.includes(teamSize)) {
    res.status(400).json({ error: 'Pick a team size.' });
    return;
  }
  if (!isEmail(email)) {
    res.status(400).json({ error: 'Enter a valid work email.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Use a password of at least 8 characters.' });
    return;
  }
  if (emailTaken(email)) {
    res.status(409).json({ error: 'This email already has a Finpulse account.' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const newCompany = db.prepare(`
    INSERT INTO companies (name, team_size)
    VALUES (?, ?)
  `).run(companyName, teamSize);

  const newUser = db.prepare(`
    INSERT INTO users (company_id, name, email, password_hash, role, is_admin, title)
    VALUES (?, ?, ?, ?, 'manager', 1, 'Admin')
  `).run(newCompany.lastInsertRowid, name, email, hash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUser.lastInsertRowid);
  req.session.userId = user.id;
  res.status(201).json(userInfo(user));
});

router.post('/signin', function (req, res) {
  const email = clean(req.body.email).toLowerCase();
  const password = clean(req.body.password);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Wrong email or password.' });
    return;
  }

  req.session.userId = user.id;
  if (req.body.remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  }
  res.json(userInfo(user));
});

router.post('/signout', function (req, res) {
  req.session.destroy(function () {
    res.json({ ok: true });
  });
});

router.get('/me', signedIn, function (req, res) {
  res.json(userInfo(req.user));
});

router.get('/team', signedIn, adminOnly, function (req, res) {
  const people = db.prepare(`
    SELECT * FROM users
    WHERE company_id = ?
    ORDER BY id
  `).all(req.user.company_id);
  const team = [];
  for (let i = 0; i < people.length; i++) {
    team.push(userInfo(people[i]));
  }
  res.json(team);
});

router.post('/team/people', signedIn, adminOnly, function (req, res) {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const role = clean(req.body.role);
  const password = clean(req.body.password);
  let title = clean(req.body.title);

  if (title === '') {
    if (role === 'manager') {
      title = 'Manager';
    } else {
      title = 'Employee';
    }
  }

  if (name === '') {
    res.status(400).json({ error: 'Enter their name.' });
    return;
  }
  if (!isEmail(email)) {
    res.status(400).json({ error: 'Enter a valid work email.' });
    return;
  }
  if (role !== 'employee' && role !== 'manager') {
    res.status(400).json({ error: 'Pick a role.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Use a password of at least 8 characters.' });
    return;
  }
  if (emailTaken(email)) {
    res.status(409).json({ error: 'This email already has a Finpulse account.' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO users (company_id, name, email, password_hash, role, title)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.company_id, name, email, hash, role, title);
  res.status(201).json({ ok: true });
});

module.exports = router;
