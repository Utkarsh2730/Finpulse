let teamClaims = [];
let chosenClaim = null;
let myQueue = 'pending';

function showApprovalStats() {
  let waitingTotal = 0;
  let waitingCount = 0;
  let approvedTotal = 0;
  let approvedCount = 0;
  let rejectedTotal = 0;
  let rejectedCount = 0;

  for (let i = 0; i < teamClaims.length; i++) {
    const claim = teamClaims[i];
    if (claim.status === myQueue) {
      waitingTotal = waitingTotal + claim.amount;
      waitingCount = waitingCount + 1;
    }
    if (claim.status === 'approved' || (myQueue === 'pending' && claim.status === 'manager_approved')) {
      approvedTotal = approvedTotal + claim.amount;
      approvedCount = approvedCount + 1;
    }
    if (claim.status === 'rejected') {
      rejectedTotal = rejectedTotal + claim.amount;
      rejectedCount = rejectedCount + 1;
    }
  }

  document.getElementById('waitingTotal').textContent = money(waitingTotal);
  document.getElementById('waitingCount').textContent = plural(waitingCount, 'claim') + ' in the queue';
  document.getElementById('approvedTotal').textContent = money(approvedTotal);
  document.getElementById('approvedCount').textContent = plural(approvedCount, 'claim') + ' approved';
  document.getElementById('rejectedTotal').textContent = money(rejectedTotal);
  document.getElementById('rejectedCount').textContent = plural(rejectedCount, 'claim') + ' rejected';
}

function queueItem(claim) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'queue-item';
  if (chosenClaim && chosenClaim.id === claim.id) {
    button.className = 'queue-item selected';
  }

  const top = document.createElement('div');
  top.className = 'claim-top';
  const title = document.createElement('span');
  title.className = 'claim-title';
  title.textContent = claim.title;
  const amount = document.createElement('span');
  amount.className = 'claim-amount';
  amount.textContent = money(claim.amount);
  top.appendChild(title);
  top.appendChild(amount);

  const person = document.createElement('p');
  person.className = 'queue-person';
  person.textContent = claim.person;

  const meta = document.createElement('p');
  meta.className = 'claim-meta';
  meta.textContent = claim.code + ' · ' + claim.category + ' · ' + shortDate(claim.date);

  button.appendChild(top);
  button.appendChild(person);
  button.appendChild(meta);
  button.addEventListener('click', function () {
    chooseClaim(claim);
  });

  item.appendChild(button);
  return item;
}

function showQueue() {
  const list = document.getElementById('queue');
  list.innerHTML = '';
  let shown = 0;

  for (let i = teamClaims.length - 1; i >= 0; i--) {
    if (teamClaims[i].status === myQueue) {
      list.appendChild(queueItem(teamClaims[i]));
      shown = shown + 1;
    }
  }

  if (shown === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'All caught up. No claims are waiting for review.';
    list.appendChild(empty);
  }
}

function showReceipt(claim) {
  const box = document.getElementById('reviewReceipt');
  box.innerHTML = '';
  if (!claim.hasReceipt) {
    box.textContent = 'No receipt attached';
    return;
  }
  const link = document.createElement('a');
  link.className = 'link';
  link.href = '/api/review/claims/' + claim.id + '/receipt';
  link.target = '_blank';
  link.textContent = claim.receiptName || 'Open receipt';
  box.appendChild(link);
}

function chooseClaim(claim) {
  chosenClaim = claim;
  document.getElementById('reviewEmpty').hidden = true;
  document.getElementById('reviewDone').hidden = true;
  document.getElementById('reviewBox').hidden = false;
  document.getElementById('reviewError').textContent = '';
  document.getElementById('reviewNote').value = '';

  document.getElementById('reviewCode').textContent = claim.code;
  document.getElementById('reviewTitle').textContent = claim.title;
  document.getElementById('reviewPerson').textContent = 'From ' + claim.person + ', ' + claim.personTitle;
  document.getElementById('reviewAmount').textContent = money(claim.amount);
  document.getElementById('reviewCategory').textContent = claim.category;
  document.getElementById('reviewDate').textContent = shortDate(claim.date);
  document.getElementById('reviewReason').textContent = claim.reason;
  document.getElementById('managerNote').textContent = claim.managerNote;
  document.getElementById('managerNoteBox').hidden = !(myQueue === 'manager_approved' && claim.managerNote);
  showReceipt(claim);
  showQueue();
}

async function decide(decision) {
  const errorBox = document.getElementById('reviewError');
  errorBox.textContent = '';
  const note = document.getElementById('reviewNote').value.trim();

  if (decision === 'rejected' && note === '') {
    errorBox.textContent = 'Add a note so they know why it was rejected.';
    return;
  }

  try {
    await sendData('/review/claims/' + chosenClaim.id, {
      decision: decision,
      note: note
    });
  } catch (error) {
    errorBox.textContent = error.message;
    return;
  }

  let word = 'approved';
  if (decision === 'rejected') {
    word = 'rejected';
  } else if (myQueue === 'pending') {
    word = 'approved and sent to finance';
  }
  const doneBox = document.getElementById('reviewDone');
  doneBox.textContent = chosenClaim.title + ' from ' + chosenClaim.person + ' is ' + word + '.';
  doneBox.hidden = false;
  document.getElementById('reviewBox').hidden = true;
  document.getElementById('reviewEmpty').hidden = false;
  chosenClaim = null;

  await loadTeamClaims();
  loadNotifications();
}

async function loadTeamClaims() {
  teamClaims = await getData('/review/claims');
  showApprovalStats();
  showQueue();
}

async function startApprovals(me) {
  if (me.role === 'finance') {
    myQueue = 'manager_approved';
  }
  if (window.location.search.includes('new=1')) {
    document.getElementById('welcome').hidden = false;
  }
  await loadTeamClaims();
  document.getElementById('approve').addEventListener('click', function () {
    decide('approved');
  });
  document.getElementById('reject').addEventListener('click', function () {
    decide('rejected');
  });
}
