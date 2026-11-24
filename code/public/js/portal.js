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

  if (thisPortal === 'employee') {
    startEmployee();
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

document.getElementById('signOut').addEventListener('click', signOut);
startPortal();
