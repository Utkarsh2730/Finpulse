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

  const thisPortal = document.body.dataset.portal;
  if (me.role !== thisPortal) {
    window.location.href = me.role + '.html';
    return;
  }

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

  const teamCard = document.getElementById('teamCard');
  if (me.isAdmin && teamCard) {
    teamCard.hidden = false;
    document.getElementById('signInLink').textContent = window.location.origin + '/sign-in';
    if (window.location.search.includes('new=1')) {
      document.getElementById('welcome').hidden = false;
    }
    setUpTeamTools();
  }
}

function setUpTeamTools() {
  showTeam();
  document.getElementById('addPerson').addEventListener('submit', addPerson);
  document.getElementById('copyDetails').addEventListener('click', copyDetails);
}

async function showTeam() {
  const people = await getData('/team');
  const list = document.getElementById('team');
  list.innerHTML = '';

  for (let i = 0; i < people.length; i++) {
    list.appendChild(personItem(people[i]));
  }
}

function personItem(person) {
  let role = 'Employee';
  if (person.isAdmin) {
    role = 'Admin';
  } else if (person.role === 'manager') {
    role = 'Manager';
  }

  const item = document.createElement('li');
  const text = document.createElement('span');
  text.textContent = person.name + ' · ' + person.email + ' · ' + role;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn';
  button.textContent = 'Reset password';
  button.addEventListener('click', function () {
    resetPassword(person);
  });

  item.appendChild(text);
  item.appendChild(button);
  return item;
}

function showDetails(intro, name, email, password) {
  const text = 'Hi ' + name + ', here are your Finpulse sign-in details.\n' +
    'Sign in at: ' + window.location.origin + '/sign-in\n' +
    'Email: ' + email + '\n' +
    'Password: ' + password;

  document.getElementById('detailsIntro').textContent = intro;
  document.getElementById('detailsText').textContent = text;
  document.getElementById('copyDetails').textContent = 'Copy details';
  document.getElementById('details').hidden = false;
  document.getElementById('details').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

async function copyDetails() {
  const text = document.getElementById('detailsText').textContent;
  await navigator.clipboard.writeText(text);
  document.getElementById('copyDetails').textContent = 'Copied';
}

async function resetPassword(person) {
  const password = window.prompt('Type a new password for ' + person.name + ' (at least 8 characters).');
  if (password === null) {
    return;
  }

  try {
    await sendData('/team/password', {
      email: person.email,
      password: password
    });
    showDetails('Password reset for ' + person.name + '. Send them these details.', person.name, person.email, password);
  } catch (error) {
    window.alert(error.message);
  }
}

async function addPerson(event) {
  event.preventDefault();
  const errorBox = document.getElementById('personError');
  errorBox.textContent = '';

  const name = document.getElementById('personName').value;
  const email = document.getElementById('personEmail').value;
  const password = document.getElementById('personPassword').value;

  try {
    await sendData('/team/people', {
      name: name,
      email: email,
      role: document.getElementById('personRole').value,
      title: document.getElementById('personTitle').value,
      password: password
    });
    showDetails(name + ' is added. Send them these details.', name, email.trim().toLowerCase(), password);
    document.getElementById('addPerson').reset();
    showTeam();
  } catch (error) {
    errorBox.textContent = error.message;
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
  if (claim.status === 'approved') {
    return claim.title + ' was approved.';
  }
  if (claim.status === 'rejected') {
    return claim.title + ' was rejected.';
  }
  return claim.title + ' is waiting for review.';
}

async function loadNotifications() {
  const claims = await getData('/claims');
  const list = document.getElementById('notificationList');
  list.innerHTML = '';
  let shown = 0;
  let waiting = 0;

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    if (claim.status === 'draft') {
      continue;
    }
    if (claim.status === 'pending') {
      waiting = waiting + 1;
    }
    if (shown === 6) {
      continue;
    }

    const item = document.createElement('li');
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
  count.textContent = waiting;
  count.hidden = waiting === 0;
  document.getElementById('notificationsNote').textContent = waiting + ' waiting for review';
}

function toggleNotifications(event) {
  event.stopPropagation();
  const panel = document.getElementById('notifications');
  panel.hidden = !panel.hidden;
  if (!panel.hidden) {
    loadNotifications();
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
