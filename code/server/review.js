const express = require('express');
const db = require('./db.js');
const auth = require('./auth.js');

const router = express.Router();
const signedIn = auth.signedIn;

function reviewersOnly(req, res, next) {
  if (req.user.role !== 'manager' && req.user.role !== 'finance') {
    res.status(403).json({ error: 'Only managers and finance can review claims.' });
    return;
  }
  next();
}

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

function reviewInfo(claim) {
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
    hasReceipt: Boolean(claim.receipt_data),
    status: claim.status,
    managerNote: claim.review_note,
    financeNote: claim.finance_note,
    person: claim.person_name,
    personTitle: claim.person_title
  };
}

function onMyTeam(user, claim) {
  if (user.role === 'finance') {
    return true;
  }
  if (claim.person_manager_id === null) {
    return true;
  }
  return claim.person_manager_id === user.id;
}

function findClaim(id, user) {
  const claim = db.prepare(`
    SELECT claims.*, users.name AS person_name, users.title AS person_title, users.manager_id AS person_manager_id
    FROM claims
    JOIN users ON users.id = claims.user_id
    WHERE claims.id = ? AND users.company_id = ? AND claims.status != 'draft'
  `).get(id, user.company_id);
  if (!claim || !onMyTeam(user, claim)) {
    return null;
  }
  return claim;
}

router.get('/review/claims', signedIn, reviewersOnly, function (req, res) {
  const claims = db.prepare(`
    SELECT claims.*, users.name AS person_name, users.title AS person_title, users.manager_id AS person_manager_id
    FROM claims
    JOIN users ON users.id = claims.user_id
    WHERE users.company_id = ? AND claims.status != 'draft'
    ORDER BY claims.created_at DESC, claims.id DESC
  `).all(req.user.company_id);

  const list = [];
  for (let i = 0; i < claims.length; i++) {
    if (onMyTeam(req.user, claims[i])) {
      list.push(reviewInfo(claims[i]));
    }
  }
  res.json(list);
});

router.get('/review/claims/:id/receipt', signedIn, reviewersOnly, function (req, res) {
  const claim = findClaim(req.params.id, req.user);
  if (!claim || !claim.receipt_data) {
    res.status(404).json({ error: 'This claim has no receipt.' });
    return;
  }

  const parts = claim.receipt_data.split(';base64,');
  const type = parts[0].replace('data:', '');
  res.type(type);
  res.send(Buffer.from(parts[1], 'base64'));
});

router.post('/review/claims/:id', signedIn, reviewersOnly, function (req, res) {
  const decision = clean(req.body.decision);
  const note = clean(req.body.note);
  const claim = findClaim(req.params.id, req.user);

  if (!claim) {
    res.status(404).json({ error: 'This claim was not found.' });
    return;
  }
  let waitingStatus = 'pending';
  if (req.user.role === 'finance') {
    waitingStatus = 'manager_approved';
  }
  if (claim.status !== waitingStatus) {
    res.status(400).json({ error: 'This claim is not waiting for you.' });
    return;
  }
  if (decision !== 'approved' && decision !== 'rejected') {
    res.status(400).json({ error: 'Pick approve or reject.' });
    return;
  }
  if (decision === 'rejected' && note === '') {
    res.status(400).json({ error: 'Add a note so they know why it was rejected.' });
    return;
  }

  if (req.user.role === 'manager') {
    let newStatus = 'rejected';
    if (decision === 'approved') {
      newStatus = 'manager_approved';
    }
    db.prepare(`
      UPDATE claims
      SET status = ?, review_note = ?
      WHERE id = ?
    `).run(newStatus, note, claim.id);
  } else {
    db.prepare(`
      UPDATE claims
      SET status = ?, finance_note = ?
      WHERE id = ?
    `).run(decision, note, claim.id);
  }

  res.json({ ok: true });
});

module.exports = router;
