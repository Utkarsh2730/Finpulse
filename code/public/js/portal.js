let currentUser = null;

async function getData(address) {
  const response = await fetch('/api' + address);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}

async function sendData(address, body) {
  const response = await fetch('/api' + address, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}

async function signOut() {
  await sendData('/signout', {});
  localStorage.removeItem('finpulse.profile');
  window.location.href = 'sign-in.html';
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

async function startPortal() {
  let me;
  try {
    me = await getData('/me');
  } catch (error) {
    localStorage.removeItem('finpulse.profile');
    window.location.href = 'sign-in.html';
    return;
  }

  const portals = document.body.dataset.portal.split(' ');
  if (!portals.includes(me.role)) {
    window.location.href = me.role + '.html';
    return;
  }

  currentUser = me;
  localStorage.setItem('finpulse.profile', JSON.stringify(me));
  setText('who', me.name);
  setText('title', me.title);
  setText('email', me.email);
  setText('company', me.company);

  const page = document.body.dataset.page;
  if (document.getElementById('bell')) {
    loadNotifications();
  }
  if (page === 'expenses') {
    startEmployee();
  }
  if (page === 'overview') {
    startOverview(me);
  }
  if (page === 'reports') {
    startReports();
  }
  if (page === 'approvals') {
    startApprovals(me);
  }
  if (page === 'all-claims') {
    startAllClaims();
  }
  if (page === 'team') {
    startTeam(me);
  }
  if (page === 'company-reports') {
    startCompanyReports();
  }

  const teamNav = document.getElementById('teamNav');
  if (teamNav && me.isAdmin) {
    teamNav.hidden = false;
  }

  const helpAdmin = document.getElementById('helpAdmin');
  if (helpAdmin && me.isAdmin) {
    helpAdmin.hidden = false;
    document.getElementById('helpText').hidden = true;
  }

  if (me.role === 'finance' && document.getElementById('approvalsNav')) {
    document.getElementById('approvalsNav').href = 'finance.html';
    document.getElementById('approvalsFoot').href = 'finance.html';
    setText('workspaceChip', 'Finance workspace');
  }

  const reportsNav = document.getElementById('reportsNav');
  if (reportsNav && me.role === 'finance') {
    reportsNav.hidden = false;
  }
}

function toggleHelp(event) {
  event.stopPropagation();
  const box = document.getElementById('helpBox');
  box.hidden = !box.hidden;
}

function closeHelp(event) {
  const box = document.getElementById('helpBox');
  if (event.target.id === 'helpClose' || !box.contains(event.target)) {
    box.hidden = true;
  }
}

function notificationText(claim) {
  if (claim.person && claim.status === 'manager_approved') {
    return 'A manager approved ' + claim.title + ' from ' + claim.person + '.';
  }
  if (claim.person) {
    return claim.person + ' sent ' + claim.title + ' for review.';
  }
  if (claim.status === 'manager_approved') {
    return claim.title + ' was approved by your manager and is with finance.';
  }
  if (claim.status === 'approved') {
    return claim.title + ' was approved.';
  }
  if (claim.status === 'rejected') {
    return claim.title + ' was rejected.';
  }
  return claim.title + ' is waiting for review.';
}

let notificationKeys = [];

function seenStorageKey() {
  return 'finpulse.seen.' + currentUser.email;
}

function readSeen() {
  const saved = localStorage.getItem(seenStorageKey());
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
}

function markAllSeen() {
  localStorage.setItem(seenStorageKey(), JSON.stringify(notificationKeys));
  document.getElementById('bellCount').hidden = true;
}

async function loadNotifications() {
  let claims = [];
  let waitingStatus = 'pending';
  const role = currentUser.role;
  if (role === 'finance') {
    waitingStatus = 'manager_approved';
  }
  if (role === 'employee') {
    claims = await getData('/claims');
  } else {
    const teamList = await getData('/review/claims');
    for (let i = 0; i < teamList.length; i++) {
      if (teamList[i].status === waitingStatus) {
        claims.push(teamList[i]);
      }
    }
  }
  const list = document.getElementById('notificationList');
  list.innerHTML = '';
  const seen = readSeen();
  notificationKeys = [];
  let shown = 0;
  let waiting = 0;
  let unseen = 0;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'draft') {
      continue;
    }
    if (claim.status === waitingStatus || (role === 'employee' && claim.status === 'manager_approved')) {
      waiting = waiting + 1;
    }

    const key = claim.id + '-' + claim.status;
    notificationKeys.push(key);
    const isNew = !seen.includes(key);
    if (isNew) {
      unseen = unseen + 1;
    }
    if (shown === 6) {
      continue;
    }

    const item = document.createElement('li');
    if (isNew) {
      item.className = 'unseen';
    }
    const dot = document.createElement('span');
    dot.className = 'dot ' + claim.status;
    const textBox = document.createElement('div');
    const text = document.createElement('p');
    text.className = 'notification-text';
    text.textContent = notificationText(claim);
    const meta = document.createElement('p');
    meta.className = 'notification-meta';
    meta.textContent = claim.code + ' · ' + money(claim.amount) + ' · ' + shortDate(claim.date);
    textBox.appendChild(text);
    textBox.appendChild(meta);
    item.appendChild(dot);
    item.appendChild(textBox);
    list.appendChild(item);
    shown = shown + 1;
  }

  if (shown === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'You have no notifications.';
    list.appendChild(empty);
  }

  const count = document.getElementById('bellCount');
  count.textContent = unseen;
  count.hidden = unseen === 0;
  document.getElementById('notificationsNote').textContent = waiting + ' waiting for review';
}

async function toggleNotifications(event) {
  event.stopPropagation();
  const panel = document.getElementById('notifications');
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    await loadNotifications();
    markAllSeen();
  }
}

function closeNotifications(event) {
  const panel = document.getElementById('notifications');
  if (!panel.hidden && !panel.contains(event.target)) {
    panel.hidden = true;
  }
}

const bellButton = document.getElementById('bell');
if (bellButton) {
  bellButton.addEventListener('click', toggleNotifications);
  document.addEventListener('click', closeNotifications);
}

const helpButton = document.getElementById('help');
if (helpButton) {
  helpButton.addEventListener('click', toggleHelp);
  document.addEventListener('click', closeHelp);
}

document.getElementById('signOut').addEventListener('click', signOut);
startPortal();
