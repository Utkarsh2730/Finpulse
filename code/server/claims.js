const express = require('express');
const db = require('./db.js');
const auth = require('./auth.js');

const router = express.Router();
const signedIn = auth.signedIn;

const CATEGORIES = [
  'Meals & entertainment',
  'Travel',
  'Local transport',
  'Accommodation',
  'Software & tools',
  'Office supplies',
  'Training',
  'Other'
];

const RECEIPT_TYPES = ['data:application/pdf', 'data:image/png', 'data:image/jpeg'];
const MAX_RECEIPT_LENGTH = 14 * 1024 * 1024;

function clean(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function claimCode(claim) {
  const year = claim.created_at.slice(0, 4);
  return 'EXP-' + year + '-' + String(claim.id).padStart(3, '0');
}

function claimInfo(claim) {
  return {
    id: claim.id,
    code: claimCode(claim),
    title: claim.title,
    category: claim.category,
    date: claim.expense_date,
    amount: claim.amount,
    currency: claim.currency,
    reason: claim.reason,
    receiptName: claim.receipt_name,
    status: claim.status,
    reviewNote: claim.finance_note || claim.review_note
  };
}

function receiptIsValid(receipt) {
  if (receipt === '') {
    return true;
  }
  if (receipt.length > MAX_RECEIPT_LENGTH) {
    return false;
  }
  for (let i = 0; i < RECEIPT_TYPES.length; i++) {
    if (receipt.startsWith(RECEIPT_TYPES[i] + ';base64,')) {
      return true;
    }
  }
  return false;
}

function readClaim(body) {
  const claim = {
    title: clean(body.title),
    category: clean(body.category),
    date: clean(body.date),
    amount: Number(body.amount),
    reason: clean(body.reason),
    receiptName: clean(body.receiptName),
    receipt: clean(body.receipt),
    status: 'pending'
  };
  if (body.status === 'draft') {
    claim.status = 'draft';
  }
  return claim;
}

function checkClaim(claim) {
  if (!claim.title) {
    return 'Enter an expense title.';
  }
  if (!receiptIsValid(claim.receipt)) {
    return 'The receipt must be a PDF, PNG or JPG of up to 10 MB.';
  }
  if (claim.status === 'draft') {
    return '';
  }
  if (!CATEGORIES.includes(claim.category)) {
    return 'Pick a category.';
  }
  if (!claim.date) {
    return 'Pick the expense date.';
  }
  if (!(claim.amount > 0)) {
    return 'Enter an amount greater than 0.';
  }
  if (!claim.reason) {
    return 'Tell us how this expense supported your work.';
  }
  return '';
}

router.get('/claims', signedIn, function (req, res) {
  const claims = db.prepare(`
    SELECT * FROM claims
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(req.user.id);

  const list = [];
  for (let i = 0; i < claims.length; i++) {
    list.push(claimInfo(claims[i]));
  }
  res.json(list);
});

router.post('/claims', signedIn, function (req, res) {
  const claim = readClaim(req.body);
  const problem = checkClaim(claim);
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }

  let amount = claim.amount;
  if (!(amount > 0)) {
    amount = 0;
  }

  const result = db.prepare(`
    INSERT INTO claims (user_id, title, category, expense_date, amount, reason, receipt_name, receipt_data, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, claim.title, claim.category, claim.date, amount, claim.reason, claim.receiptName, claim.receipt, claim.status);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.post('/claims/:id', signedIn, function (req, res) {
  const saved = db.prepare('SELECT * FROM claims WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!saved) {
    res.status(404).json({ error: 'This claim was not found.' });
    return;
  }
  if (saved.status !== 'draft') {
    res.status(400).json({ error: 'Only drafts can be changed.' });
    return;
  }

  const claim = readClaim(req.body);
  const problem = checkClaim(claim);
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }

  let amount = claim.amount;
  if (!(amount > 0)) {
    amount = 0;
  }

  let receiptName = claim.receiptName;
  let receipt = claim.receipt;
  if (receipt === '') {
    receiptName = saved.receipt_name;
    receipt = saved.receipt_data;
  }

  db.prepare(`
    UPDATE claims
    SET title = ?, category = ?, expense_date = ?, amount = ?, reason = ?, receipt_name = ?, receipt_data = ?, status = ?
    WHERE id = ?
  `).run(claim.title, claim.category, claim.date, amount, claim.reason, receiptName, receipt, claim.status, saved.id);

  res.json({ id: saved.id });
});

module.exports = router;
