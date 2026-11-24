const RECEIPT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;

let allClaims = [];
let showAll = false;
let editingId = null;
let receiptName = '';
let receiptData = '';

function fillMonths() {
  const select = document.getElementById('month');
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  for (let i = 0; i < 12; i++) {
    const option = document.createElement('option');
    option.value = year + '-' + String(month + 1).padStart(2, '0');
    option.textContent = MONTH_NAMES[month] + ' ' + year;
    select.appendChild(option);

    month = month - 1;
    if (month < 0) {
      month = 11;
      year = year - 1;
    }
  }
}

async function loadClaims() {
  allClaims = await getData('/claims');
  showStats();
  showClaims();
}

function showStats() {
  const month = document.getElementById('month').value;
  let pendingTotal = 0;
  let pendingCount = 0;
  let approvedTotal = 0;
  let approvedCount = 0;
  let claimedTotal = 0;
  let claimedCount = 0;

  for (let i = 0; i < allClaims.length; i++) {
    const claim = allClaims[i];
    const inMonth = claim.date.startsWith(month);

    if (claim.status === 'pending') {
      pendingTotal = pendingTotal + claim.amount;
      pendingCount = pendingCount + 1;
    }
    if (claim.status === 'approved' && inMonth) {
      approvedTotal = approvedTotal + claim.amount;
      approvedCount = approvedCount + 1;
    }
    if (claim.status !== 'draft' && inMonth) {
      claimedTotal = claimedTotal + claim.amount;
      claimedCount = claimedCount + 1;
    }
  }

  document.getElementById('pendingTotal').textContent = money(pendingTotal);
  document.getElementById('pendingCount').textContent = plural(pendingCount, 'claim') + ' in review';
  document.getElementById('approvedTotal').textContent = money(approvedTotal);
  document.getElementById('approvedCount').textContent = plural(approvedCount, 'claim') + ' approved';
  document.getElementById('claimedTotal').textContent = money(claimedTotal);
  document.getElementById('claimedCount').textContent = plural(claimedCount, 'claim') + ' this month';
}

function claimNote(claim) {
  if (claim.status === 'draft') {
    return 'Saved as a draft. Only you can see it.';
  }
  if (claim.status === 'pending') {
    return 'Waiting for a manager to review.';
  }
  if (claim.reviewNote) {
    return '"' + claim.reviewNote + '"';
  }
  if (claim.status === 'approved') {
    return 'Approved by your manager.';
  }
  return 'Rejected by your manager.';
}

function showClaims() {
  const list = document.getElementById('claimList');
  const viewAll = document.getElementById('viewAll');
  list.innerHTML = '';

  if (allClaims.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No claims yet. Your first one will show up here.';
    list.appendChild(empty);
  }

  let howMany = allClaims.length;
  if (!showAll && howMany > 3) {
    howMany = 3;
  }

  for (let i = 0; i < howMany; i++) {
    list.appendChild(claimItem(allClaims[i]));
  }

  viewAll.hidden = allClaims.length <= 3;
  if (showAll) {
    viewAll.firstChild.textContent = 'Show less ';
  } else {
    viewAll.firstChild.textContent = 'View all ';
  }
}

function claimItem(claim) {
  const item = document.createElement('li');

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

  const meta = document.createElement('p');
  meta.className = 'claim-meta';
  meta.textContent = claim.code + ' · ' + shortDate(claim.date);

  const badge = document.createElement('span');
  badge.className = 'badge ' + claim.status;
  badge.textContent = statusName(claim.status);

  const note = document.createElement('p');
  note.className = 'claim-note';
  note.textContent = claimNote(claim);

  item.appendChild(top);
  item.appendChild(meta);
  item.appendChild(badge);
  item.appendChild(note);

  if (claim.status === 'draft') {
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'link';
    edit.textContent = 'Continue editing';
    edit.addEventListener('click', function () {
      editDraft(claim);
    });
    item.appendChild(edit);
  }

  return item;
}

function toggleAll() {
  showAll = !showAll;
  showClaims();
}

function useReceipt(file) {
  const errorBox = document.getElementById('formError');
  errorBox.textContent = '';

  if (!RECEIPT_TYPES.includes(file.type)) {
    errorBox.textContent = 'The receipt must be a PDF, PNG or JPG file.';
    return;
  }
  if (file.size > MAX_RECEIPT_SIZE) {
    errorBox.textContent = 'The receipt must be 10 MB or smaller.';
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', function () {
    receiptName = file.name;
    receiptData = reader.result;
    document.getElementById('dropText').textContent = 'Attached: ' + file.name;
    document.getElementById('drop').classList.add('has-file');
  });
  reader.readAsDataURL(file);
}

function pickReceipt(event) {
  const file = event.target.files[0];
  if (file) {
    useReceipt(file);
  }
}

function dragOver(event) {
  event.preventDefault();
  document.getElementById('drop').classList.add('dragging');
}

function dragLeave() {
  document.getElementById('drop').classList.remove('dragging');
}

function dropReceipt(event) {
  event.preventDefault();
  dragLeave();
  const file = event.dataTransfer.files[0];
  if (file) {
    useReceipt(file);
  }
}

function resetForm() {
  document.getElementById('claimForm').reset();
  document.getElementById('date').value = today();
  document.getElementById('dropText').innerHTML = 'Drop your receipt here, or <u>browse files</u>';
  document.getElementById('drop').classList.remove('has-file');
  document.getElementById('formHeading').textContent = 'New expense claim';
  document.getElementById('cancelDraft').hidden = true;
  document.getElementById('formError').textContent = '';
  editingId = null;
  receiptName = '';
  receiptData = '';
}

function editDraft(claim) {
  resetForm();
  editingId = claim.id;
  document.getElementById('formHeading').textContent = 'Edit draft ' + claim.code;
  document.getElementById('cancelDraft').hidden = false;
  document.getElementById('formDone').hidden = true;
  document.getElementById('claimTitle').value = claim.title;
  document.getElementById('category').value = claim.category;
  document.getElementById('date').value = claim.date;
  document.getElementById('reason').value = claim.reason;
  if (claim.amount > 0) {
    document.getElementById('amount').value = claim.amount;
  } else {
    document.getElementById('amount').value = '';
  }
  if (claim.receiptName) {
    document.getElementById('dropText').textContent = 'Attached: ' + claim.receiptName;
    document.getElementById('drop').classList.add('has-file');
  }
  document.getElementById('claimTitle').focus();
}

async function saveClaim(status) {
  const errorBox = document.getElementById('formError');
  const doneBox = document.getElementById('formDone');
  errorBox.textContent = '';
  doneBox.hidden = true;

  const claim = {
    title: document.getElementById('claimTitle').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    amount: document.getElementById('amount').value,
    reason: document.getElementById('reason').value,
    receiptName: receiptName,
    receipt: receiptData,
    status: status
  };

  let address = '/claims';
  if (editingId) {
    address = '/claims/' + editingId;
  }

  try {
    await sendData(address, claim);
    resetForm();
    if (status === 'draft') {
      doneBox.textContent = 'Draft saved. You can finish it from Recent claims.';
    } else {
      doneBox.textContent = 'Claim submitted. A manager will review it soon.';
    }
    doneBox.hidden = false;
    await loadClaims();
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

function submitClaim(event) {
  event.preventDefault();
  saveClaim('pending');
}

function saveDraft() {
  saveClaim('draft');
}

function startEmployee() {
  fillMonths();
  document.getElementById('date').value = today();
  document.getElementById('month').addEventListener('change', showStats);
  document.getElementById('viewAll').addEventListener('click', toggleAll);
  document.getElementById('receipt').addEventListener('change', pickReceipt);
  document.getElementById('drop').addEventListener('dragover', dragOver);
  document.getElementById('drop').addEventListener('dragleave', dragLeave);
  document.getElementById('drop').addEventListener('drop', dropReceipt);
  document.getElementById('claimForm').addEventListener('submit', submitClaim);
  document.getElementById('saveDraft').addEventListener('click', saveDraft);
  document.getElementById('cancelDraft').addEventListener('click', resetForm);
  openPage();
}

async function openPage() {
  await loadClaims();
  const params = new URLSearchParams(window.location.search);
  const draftId = Number(params.get('draft'));
  for (let i = 0; i < allClaims.length; i++) {
    if (allClaims[i].id === draftId && allClaims[i].status === 'draft') {
      editDraft(allClaims[i]);
    }
  }
}
