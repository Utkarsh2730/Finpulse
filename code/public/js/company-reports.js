let companyClaims = [];

function wholeRupees(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

function barLabel(amount) {
  if (amount === 0) {
    return '';
  }
  if (amount >= 1000) {
    return '₹' + (amount / 1000).toFixed(1) + 'k';
  }
  return '₹' + Math.round(amount);
}

function fillCompanyYears() {
  const select = document.getElementById('year');
  const thisYear = new Date().getFullYear();
  let oldest = thisYear;

  for (let i = 0; i < companyClaims.length; i++) {
    const year = Number(companyClaims[i].date.slice(0, 4));
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

function companyClaimsForYear() {
  const year = document.getElementById('year').value;
  const list = [];
  for (let i = 0; i < companyClaims.length; i++) {
    if (companyClaims[i].date.startsWith(year)) {
      list.push(companyClaims[i]);
    }
  }
  return list;
}

function counts(claim) {
  const measure = document.getElementById('measure').value;
  if (measure === 'approved') {
    return claim.status === 'approved';
  }
  return true;
}

function peopleIn(claims) {
  const names = [];
  for (let i = 0; i < claims.length; i++) {
    if (!names.includes(claims[i].person)) {
      names.push(claims[i].person);
    }
  }
  names.sort();
  return names;
}

function monthTotals(claims, person) {
  const totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (!counts(claim)) {
      continue;
    }
    if (person !== 'all' && claim.person !== person) {
      continue;
    }
    const month = Number(claim.date.slice(5, 7)) - 1;
    totals[month] = totals[month] + claim.amount;
  }
  return totals;
}

function addUp(totals) {
  let sum = 0;
  for (let i = 0; i < totals.length; i++) {
    sum = sum + totals[i];
  }
  return sum;
}

function showCompanyStats(claims) {
  let spent = 0;
  let spentCount = 0;
  let waiting = 0;
  let waitingCount = 0;
  const approvedByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'approved') {
      spent = spent + claim.amount;
      spentCount = spentCount + 1;
      const month = Number(claim.date.slice(5, 7)) - 1;
      approvedByMonth[month] = approvedByMonth[month] + claim.amount;
    }
    if (claim.status === 'pending' || claim.status === 'manager_approved') {
      waiting = waiting + claim.amount;
      waitingCount = waitingCount + 1;
    }
  }

  let biggest = 0;
  for (let i = 1; i < 12; i++) {
    if (approvedByMonth[i] > approvedByMonth[biggest]) {
      biggest = i;
    }
  }

  document.getElementById('yearSpent').textContent = money(spent);
  document.getElementById('yearSpentCount').textContent = plural(spentCount, 'claim') + ' approved';
  document.getElementById('yearWaiting').textContent = money(waiting);
  document.getElementById('yearWaitingCount').textContent = plural(waitingCount, 'claim') + ' with a manager or finance';

  if (approvedByMonth[biggest] === 0) {
    document.getElementById('biggestMonth').textContent = '-';
    document.getElementById('biggestMonthNote').textContent = 'No spend yet';
  } else {
    document.getElementById('biggestMonth').textContent = MONTH_NAMES[biggest];
    document.getElementById('biggestMonthNote').textContent = money(approvedByMonth[biggest]) + ' spent';
  }
}

function fillChartPeople(claims) {
  const select = document.getElementById('chartPerson');
  const chosen = select.value;
  select.innerHTML = '';

  const everyone = document.createElement('option');
  everyone.value = 'all';
  everyone.textContent = 'Whole company';
  select.appendChild(everyone);

  const names = peopleIn(claims);
  for (let i = 0; i < names.length; i++) {
    const option = document.createElement('option');
    option.value = names[i];
    option.textContent = names[i];
    select.appendChild(option);
  }

  if (chosen && names.includes(chosen)) {
    select.value = chosen;
  }
}

function showCompanyChart(claims) {
  const person = document.getElementById('chartPerson').value;
  const measure = document.getElementById('measure').value;
  const totals = monthTotals(claims, person);

  let what = 'Approved claims';
  if (measure === 'claimed') {
    what = 'Every submitted claim';
  }
  if (person === 'all') {
    document.getElementById('chartTitle').textContent = 'Company spend by month';
    document.getElementById('chartNote').textContent = what + ' from everyone at the company.';
  } else {
    document.getElementById('chartTitle').textContent = person + ' by month';
    document.getElementById('chartNote').textContent = what + ' from ' + person + '. Total ' + money(addUp(totals)) + '.';
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

    const value = document.createElement('span');
    value.className = 'bar-value';
    value.textContent = barLabel(totals[i]);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = height + '%';
    track.appendChild(bar);

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = MONTH_NAMES[i].slice(0, 3);

    column.appendChild(value);
    column.appendChild(track);
    column.appendChild(label);
    chart.appendChild(column);
  }
}

function addMonthCell(row, amount, className) {
  const cell = document.createElement('td');
  cell.textContent = wholeRupees(amount);
  if (amount === 0) {
    cell.className = 'zero';
  }
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
}

function showPersonInChart(name) {
  document.getElementById('chartPerson').value = name;
  showCompanyChart(companyClaimsForYear());
  document.getElementById('monthChart').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function showMonthTable(claims) {
  const head = document.getElementById('monthHead');
  head.innerHTML = '';
  const headings = ['Employee'];
  for (let i = 0; i < 12; i++) {
    headings.push(MONTH_NAMES[i].slice(0, 3));
  }
  headings.push('Total');
  for (let i = 0; i < headings.length; i++) {
    const cell = document.createElement('th');
    cell.textContent = headings[i];
    head.appendChild(cell);
  }

  const rows = document.getElementById('personRows');
  rows.innerHTML = '';
  const names = peopleIn(claims);

  if (names.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 14;
    cell.className = 'empty';
    cell.textContent = 'No claims in this year yet.';
    row.appendChild(cell);
    rows.appendChild(row);
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const totals = monthTotals(claims, name);
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'person-link';
    button.textContent = name;
    button.addEventListener('click', function () {
      showPersonInChart(name);
    });
    nameCell.appendChild(button);
    row.appendChild(nameCell);

    for (let j = 0; j < 12; j++) {
      addMonthCell(row, totals[j], '');
    }
    addMonthCell(row, addUp(totals), 'total');
    rows.appendChild(row);
  }

  const companyTotals = monthTotals(claims, 'all');
  const totalRow = document.getElementById('totalRow');
  totalRow.innerHTML = '';
  const label = document.createElement('td');
  label.textContent = 'Whole company';
  totalRow.appendChild(label);
  for (let j = 0; j < 12; j++) {
    addMonthCell(totalRow, companyTotals[j], 'total');
  }
  addMonthCell(totalRow, addUp(companyTotals), 'total');

  let what = 'Approved amounts.';
  if (document.getElementById('measure').value === 'claimed') {
    what = 'Every submitted claim, whatever its status.';
  }
  document.getElementById('tableNote').textContent = what + ' Click a name to see it in the chart.';
}

function showCompanyReport() {
  const claims = companyClaimsForYear();
  showCompanyStats(claims);
  fillChartPeople(claims);
  showCompanyChart(claims);
  showMonthTable(claims);
}

function csvText(value) {
  const text = String(value).replaceAll('"', '""');
  return '"' + text + '"';
}

function downloadMonthCsv() {
  const claims = companyClaimsForYear();
  const names = peopleIn(claims);
  const header = ['Employee'];
  for (let i = 0; i < 12; i++) {
    header.push(MONTH_NAMES[i]);
  }
  header.push('Total');

  const lines = [];
  const headerCells = [];
  for (let i = 0; i < header.length; i++) {
    headerCells.push(csvText(header[i]));
  }
  lines.push(headerCells.join(','));

  names.push('all');
  for (let i = 0; i < names.length; i++) {
    const totals = monthTotals(claims, names[i]);
    let name = names[i];
    if (name === 'all') {
      name = 'Whole company';
    }
    const cells = [csvText(name)];
    for (let j = 0; j < 12; j++) {
      cells.push(csvText(totals[j].toFixed(2)));
    }
    cells.push(csvText(addUp(totals).toFixed(2)));
    lines.push(cells.join(','));
  }

  const file = new Blob([lines.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'finpulse-company-' + document.getElementById('year').value + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function startCompanyReports() {
  companyClaims = await getData('/review/claims');
  fillCompanyYears();
  showCompanyReport();
  document.getElementById('year').addEventListener('change', showCompanyReport);
  document.getElementById('measure').addEventListener('change', showCompanyReport);
  document.getElementById('chartPerson').addEventListener('change', function () {
    showCompanyChart(companyClaimsForYear());
  });
  document.getElementById('download').addEventListener('click', downloadMonthCsv);
}
