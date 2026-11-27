let allClaims = [];

function fillPeople() {
  const select = document.getElementById('personFilter');
  const names = [];
  for (let i = 0; i < allClaims.length; i++) {
    if (!names.includes(allClaims[i].person)) {
      names.push(allClaims[i].person);
    }
  }
  names.sort();

  for (let i = 0; i < names.length; i++) {
    const option = document.createElement('option');
    option.value = names[i];
    option.textContent = names[i];
    select.appendChild(option);
  }
}

function pickedClaims() {
  const person = document.getElementById('personFilter').value;
  const status = document.getElementById('statusFilter').value;
  const list = [];
  for (let i = 0; i < allClaims.length; i++) {
    const claim = allClaims[i];
    if (person !== 'all' && claim.person !== person) {
      continue;
    }
    if (status !== 'all' && claim.status !== status) {
      continue;
    }
    list.push(claim);
  }
  return list;
}

function addTableCell(row, text, className) {
  const cell = document.createElement('td');
  if (typeof text === 'string') {
    cell.textContent = text;
  } else {
    cell.appendChild(text);
  }
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
}

function showAllClaims() {
  const claims = pickedClaims();
  const rows = document.getElementById('claimRows');
  rows.innerHTML = '';

  if (claims.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'empty';
    cell.textContent = 'No claims match this filter.';
    row.appendChild(cell);
    rows.appendChild(row);
    return;
  }

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const row = document.createElement('tr');
    addTableCell(row, claim.code, 'muted');
    addTableCell(row, claim.person, '');
    addTableCell(row, claim.title, '');
    addTableCell(row, claim.category, '');
    addTableCell(row, shortDate(claim.date), '');
    addTableCell(row, makeBadge(claim.status), '');
    addTableCell(row, money(claim.amount), 'right');
    rows.appendChild(row);
  }
}

function csvCell(value) {
  const text = String(value).replaceAll('"', '""');
  return '"' + text + '"';
}

function downloadTeamCsv() {
  const claims = pickedClaims();
  const lines = ['Claim,Person,Title,Category,Date,Status,Amount (INR),Note'];

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const values = [claim.code, claim.person, claim.title, claim.category, claim.date, statusName(claim.status), claim.amount.toFixed(2), claim.reviewNote || ''];
    const cells = [];
    for (let j = 0; j < values.length; j++) {
      cells.push(csvCell(values[j]));
    }
    lines.push(cells.join(','));
  }

  const file = new Blob([lines.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'finpulse-team-claims.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function startAllClaims() {
  allClaims = await getData('/review/claims');
  fillPeople();
  showAllClaims();
  document.getElementById('personFilter').addEventListener('change', showAllClaims);
  document.getElementById('statusFilter').addEventListener('change', showAllClaims);
  document.getElementById('download').addEventListener('click', downloadTeamCsv);
}
