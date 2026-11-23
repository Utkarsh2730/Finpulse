const bcrypt = require('bcryptjs');
const db = require('./db.js');

const PASSWORD = 'finpulse123';

const people = [
  {
    name: 'Tanushree Bhowmik',
    email: 'tanushree.bhowmik@ubhar.company',
    role: 'manager',
    isAdmin: 1,
    title: 'Finance manager'
  },
  {
    name: 'Harjot Dhillon',
    email: 'harjot.dhillon@ubhar.company',
    role: 'manager',
    isAdmin: 0,
    title: 'Manager'
  },
  {
    name: 'Siddhesh Parab',
    email: 'siddhesh.parab@ubhar.company',
    role: 'employee',
    isAdmin: 0,
    title: 'Product designer'
  },
  {
    name: 'Lalrinpuii Ralte',
    email: 'lalrinpuii.ralte@ubhar.company',
    role: 'employee',
    isAdmin: 0,
    title: 'Employee'
  },
  {
    name: 'Pranjal Bora',
    email: 'pranjal.bora@ubhar.company',
    role: 'employee',
    isAdmin: 0,
    title: 'Employee'
  },
  {
    name: 'Zoya Mir',
     email: 'zoya.mir@ubhar.company',
     role: 'employee',
     isAdmin: 0,
     title: 'Employee' },
  {
    name: 'Rinchen Bhutia',
    email: 'rinchen.bhutia@ubhar.company',
    role: 'employee',
    isAdmin: 0,
    title: 'Employee'
  }
];

let company = db.prepare("SELECT id FROM companies WHERE name = 'Ubhar'").get();
let companyId;
if (company) {
  companyId = company.id;
} else {
  const result = db.prepare(`
    INSERT INTO companies (name, team_size)
    VALUES ('Ubhar', '11-50 people')
  `).run();
  companyId = result.lastInsertRowid;
}

const hash = bcrypt.hashSync(PASSWORD, 10);
let added = 0;

for (let i = 0; i < people.length; i++) {
  const person = people[i];
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(person.email);
  if (existing) {
    continue;
  }
  db.prepare(`
    INSERT INTO users (company_id, name, email, password_hash, role, is_admin, title)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(companyId, person.name, person.email, hash, person.role, person.isAdmin, person.title);
  added = added + 1;
}

console.log('Added ' + added + ' demo account(s) to Ubhar. Password for all: ' + PASSWORD);
console.log('Sign in at http://localhost:3000/sign-in');
