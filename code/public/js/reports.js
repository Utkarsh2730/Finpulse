let reportClaims = [];

function fillYears() {
  const select = document.getElementById('year');
  const thisYear = new Date().getFullYear();
  let oldest = thisYear;

  for (let i = 0; i < reportClaims.length; i++) {
    const year = Number(reportClaims[i].date.slice(0, 4));
    if (year > 2000 && year < oldest) {
      oldest = year;
    }
  }

  for (let year = thisYear; year >= oldest; year--) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    select.appendChild(option);
  }
}

function claimsForYear() {
  const year = document.getElementById('year').value;
  const list = [];
  for (let i = 0; i < reportClaims.length; i++) {
    if (reportClaims[i].date.startsWith(year)) {
      list.push(reportClaims[i]);
    }
  }
  return list;
}

function showYearStats(claims) {
  let claimed = 0;
  let count = 0;
  let approved = 0;
  let approvedCount = 0;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'draft') {
      continue;
    }
    claimed = claimed + claim.amount;
    count = count + 1;
    if (claim.status === 'approved') {
      approved = approved + claim.amount;
      approvedCount = approvedCount + 1;
    }
  }

  let average = 0;
  if (count > 0) {
    average = claimed / count;
  }

  document.getElementById('yearClaimed').textContent = money(claimed);
  document.getElementById('yearCount').textContent = plural(count, 'claim') + ' this year';
  document.getElementById('yearApproved').textContent = money(approved);
  document.getElementById('yearApprovedCount').textContent = plural(approvedCount, 'claim') + ' approved';
  document.getElementById('yearAverage').textContent = money(average);
}

function showMonthChart(claims) {
  const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < claims.length; i++) {
    if (claims[i].status === 'draft') {
      continue;
    }
    const month = Number(claims[i].date.slice(5, 7)) - 1;
    totals[month] = totals[month] + claims[i].amount;
  }

  let biggest = 0;
  for (let i = 0; i < 12; i++) {
    if (totals[i] > biggest) {
      biggest = totals[i];
    }
  }

  const chart = document.getElementById('monthChart');
  chart.innerHTML = '';

  for (let i = 0; i < 12; i++) {
    let height = 0;
    if (biggest > 0) {
      height = Math.round((totals[i] / biggest) * 100);
    }

    const column = document.createElement('div');
    column.className = 'bar-column';
    column.title = MONTH_NAMES[i] + ': ' + money(totals[i]);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = height + '%';
    track.appendChild(bar);

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = MONTH_NAMES[i].slice(0, 3);

    column.appendChild(track);
    column.appendChild(label);
    chart.appendChild(column);
  }
}

function showCategories(claims) {
  const names = [];
  const totals = [];
  let grandTotal = 0;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'draft') {
      continue;
    }
    let place = names.indexOf(claim.category);
    if (place === -1) {
      names.push(claim.category);
      totals.push(0);
      place = names.length - 1;
    }
    totals[place] = totals[place] + claim.amount;
    grandTotal = grandTotal + claim.amount;
  }

  const list = document.getElementById('categoryList');
  list.innerHTML = '';

  if (names.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No claims in this year yet.';
    list.appendChild(empty);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const share = Math.round((totals[i] / grandTotal) * 100);

    const item = document.createElement('li');
    const top = document.createElement('div');
    top.className = 'claim-top';
    const name = document.createElement('span');
    name.textContent = names[i];
    const amount = document.createElement('span');
    amount.className = 'claim-amount';
    amount.textContent = money(totals[i]) + ' · ' + share + '%';
    top.appendChild(name);
    top.appendChild(amount);

    const track = document.createElement('div');
    track.className = 'line-track';
    const fill = document.createElement('div');
    fill.className = 'line-fill';
    fill.style.width = share + '%';
    track.appendChild(fill);

    item.appendChild(top);
    item.appendChild(track);
    list.appendChild(item);
  }
}

function filteredClaims(claims) {
  const status = document.getElementById('statusFilter').value;
  if (status === 'all') {
    return claims;
  }
  const list = [];
  for (let i = 0; i < claims.length; i++) {
    if (claims[i].status === status) {
      list.push(claims[i]);
    }
  }
  return list;
}

function addCell(row, text, className) {
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

function showTable(claims) {
  const rows = document.getElementById('claimRows');
  rows.innerHTML = '';

  if (claims.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty';
    cell.textContent = 'No claims match this filter.';
    row.appendChild(cell);
    rows.appendChild(row);
    return;
  }

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const row = document.createElement('tr');
    addCell(row, claim.code, 'muted');
    addCell(row, claim.title, '');
    addCell(row, claim.category || '-', '');
    addCell(row, shortDate(claim.date), '');
    addCell(row, makeBadge(claim.status), '');
    addCell(row, money(claim.amount), 'right');
    rows.appendChild(row);
  }
}

function showReport() {
  const claims = claimsForYear();
  showYearStats(claims);
  showMonthChart(claims);
  showCategories(claims);
  showTable(filteredClaims(claims));
  document.getElementById('tableNote').textContent = 'Every claim you made in ' + document.getElementById('year').value + '.';
}

function csvValue(value) {
  const text = String(value).replaceAll('"', '""');
  return '"' + text + '"';
}

function downloadCsv() {
  const claims = filteredClaims(claimsForYear());
  const lines = ['Claim,Title,Category,Date,Status,Amount (INR)'];

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const values = [claim.code, claim.title, claim.category, claim.date, statusName(claim.status), claim.amount.toFixed(2)];
    const cells = [];
    for (let j = 0; j < values.length; j++) {
      cells.push(csvValue(values[j]));
    }
    lines.push(cells.join(','));
  }

  const file = new Blob([lines.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'finpulse-claims-' + document.getElementById('year').value + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function startReports() {
  reportClaims = await getData('/claims');
  fillYears();
  showReport();
  document.getElementById('year').addEventListener('change', showReport);
  document.getElementById('statusFilter').addEventListener('change', showReport);
  document.getElementById('download').addEventListener('click', downloadCsv);
}
