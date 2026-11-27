let teamPeople = [];

function roleName(person) {
  if (person.isAdmin) {
    return 'Admin';
  }
  if (person.role === 'manager') {
    return 'Manager';
  }
  if (person.role === 'finance') {
    return 'Finance';
  }
  return 'Employee';
}

function personItem(person) {
  const item = document.createElement('li');

  const left = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'person-name';
  name.textContent = person.name;
  const meta = document.createElement('p');
  meta.className = 'person-meta';
  meta.textContent = person.email + ' · ' + person.title;
  left.appendChild(name);
  left.appendChild(meta);
  if (person.role === 'employee' && !person.isAdmin) {
    left.appendChild(managerPick(person));
  }

  const right = document.createElement('div');
  right.className = 'person-right';
  let role;
  if (person.isAdmin) {
    role = document.createElement('span');
    role.className = 'role admin';
    role.textContent = roleName(person);
  } else {
    role = roleSelect(person);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn';
  if (person.email === currentUser.email) {
    button.textContent = 'Change password';
    button.addEventListener('click', openPasswordCard);
  } else {
    button.textContent = 'Reset password';
    button.addEventListener('click', function () {
      resetPassword(person);
    });
  }

  right.appendChild(role);
  right.appendChild(button);
  item.appendChild(left);
  item.appendChild(right);
  return item;
}

function roleSelect(person) {
  const select = document.createElement('select');
  select.className = 'role-select';
  select.setAttribute('aria-label', 'Role of ' + person.name);

  const roles = ['employee', 'manager', 'finance'];
  const names = ['Employee', 'Manager', 'Finance manager'];
  for (let i = 0; i < roles.length; i++) {
    const option = document.createElement('option');
    option.value = roles[i];
    option.textContent = names[i];
    select.appendChild(option);
  }
  select.value = person.role;

  select.addEventListener('change', function () {
    changeRole(person, select);
  });
  return select;
}

function managerPick(person) {
  const box = document.createElement('label');
  box.className = 'manager-pick';
  box.textContent = 'Reports to ';

  const select = document.createElement('select');
  select.className = 'role-select';
  select.setAttribute('aria-label', 'Manager of ' + person.name);

  const nobody = document.createElement('option');
  nobody.value = '';
  nobody.textContent = 'No manager yet';
  select.appendChild(nobody);

  for (let i = 0; i < teamPeople.length; i++) {
    if (teamPeople[i].role === 'manager') {
      const option = document.createElement('option');
      option.value = teamPeople[i].email;
      option.textContent = teamPeople[i].name;
      select.appendChild(option);
    }
  }
  select.value = person.managerEmail;

  select.addEventListener('change', function () {
    changeManager(person, select);
  });
  box.appendChild(select);
  return box;
}

async function changeManager(person, select) {
  try {
    await sendData('/team/manager', {
      email: person.email,
      managerEmail: select.value
    });
    showTeam();
  } catch (error) {
    window.alert(error.message);
    select.value = person.managerEmail;
  }
}

async function changeRole(person, select) {
  const newName = select.options[select.selectedIndex].textContent;
  let message = 'Make ' + person.name + ' a ' + newName + '? They will see the ' + newName + ' portal the next time a page loads.';
  if (person.role === 'manager') {
    message = message + ' Their team will have no manager until you pick a new one.';
  }
  const sure = window.confirm(message);
  if (!sure) {
    select.value = person.role;
    return;
  }

  try {
    await sendData('/team/role', {
      email: person.email,
      role: select.value
    });
    showTeam();
  } catch (error) {
    window.alert(error.message);
    select.value = person.role;
  }
}

async function showTeam() {
  teamPeople = await getData('/team');
  const list = document.getElementById('team');
  list.innerHTML = '';

  for (let i = 0; i < teamPeople.length; i++) {
    list.appendChild(personItem(teamPeople[i]));
  }
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

function openPasswordCard() {
  const card = document.getElementById('passwordCard');
  card.reset();
  document.getElementById('passwordError').textContent = '';
  document.getElementById('passwordDone').hidden = true;
  card.hidden = false;
  document.getElementById('currentPassword').focus();
}

function closePasswordCard() {
  document.getElementById('passwordCard').hidden = true;
}

async function changeMyPassword(event) {
  event.preventDefault();
  const errorBox = document.getElementById('passwordError');
  errorBox.textContent = '';
  document.getElementById('passwordDone').hidden = true;

  try {
    await sendData('/me/password', {
      currentPassword: document.getElementById('currentPassword').value,
      newPassword: document.getElementById('newPassword').value
    });
    document.getElementById('passwordCard').reset();
    document.getElementById('passwordDone').hidden = false;
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

function startTeam(me) {
  document.getElementById('signInLink').textContent = window.location.origin + '/sign-in';
  if (!me.isAdmin) {
    document.getElementById('notAdmin').hidden = false;
    return;
  }
  document.getElementById('teamTools').hidden = false;
  showTeam();
  document.getElementById('addPerson').addEventListener('submit', addPerson);
  document.getElementById('copyDetails').addEventListener('click', copyDetails);
  document.getElementById('passwordCard').addEventListener('submit', changeMyPassword);
  document.getElementById('passwordCancel').addEventListener('click', closePasswordCard);
}
