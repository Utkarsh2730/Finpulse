const express = require('express');
const session = require('express-session');
const path = require('path');
const authRouter = require('./auth.js');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(session({
  secret: 'finpulse-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use('/api', authRouter);
app.use(express.static(path.join(__dirname, '..', 'public', 'html'), { extensions: ['html'] }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server. Try again.' });
});

app.listen(PORT, function () {
  console.log('Finpulse is running at http://localhost:' + PORT);
});
