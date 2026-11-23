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
  document.getElementById('who').textContent = me.name;
  document.getElementById('title').textContent = me.title;
  document.getElementById('email').textContent = me.email;
  document.getElementById('company').textContent = me.company;

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
}

async function showTeam() {
  const people = await getData('/team');
  const list = document.getElementById('team');
  list.innerHTML = '';

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    let role = 'Employee';
    if (person.isAdmin) {
      role = 'Admin';
    } else if (person.role === 'manager') {
      role = 'Manager';
    }
    const item = document.createElement('li');
    item.textContent = person.name + ' · ' + person.email + ' · ' + role;
    list.appendChild(item);
  }
}

async function addPerson(event) {
  event.preventDefault();
  const errorBox = document.getElementById('personError');
  const doneBox = document.getElementById('personDone');
  errorBox.textContent = '';
  doneBox.hidden = true;

  const name = document.getElementById('personName').value;
  const email = document.getElementById('personEmail').value;
  const role = document.getElementById('personRole').value;

  try {
    await sendData('/team/people', {
      name: name,
      email: email,
      role: role,
      title: document.getElementById('personTitle').value,
      password: document.getElementById('personPassword').value
    });
    doneBox.textContent = name + ' can now sign in with ' + email + ' and the password you set.';
    doneBox.hidden = false;
    document.getElementById('addPerson').reset();
    showTeam();
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

document.getElementById('signOut').addEventListener('click', signOut);
startPortal();
