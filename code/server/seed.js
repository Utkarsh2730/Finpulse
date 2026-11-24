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

const claims = [
  {
    title: 'Client lunch',
    category: 'Meals & entertainment',
    date: '2026-11-14',
    amount: 1285.50,
    reason: 'Lunch with the Kaveri Foods team to review the new onboarding plan.',
    status: 'pending',
    note: null
  },
  {
    title: 'Design conference',
    category: 'Training',
    date: '2026-11-10',
    amount: 6500,
    reason: 'Ticket for the Bengaluru design systems conference.',
    status: 'approved',
    note: 'Approved. Relevant to your team\'s work.'
  },
  {
    title: 'Airport cab',
    category: 'Local transport',
    date: '2026-11-06',
    amount: 864,
    reason: 'Cab from the airport after the client visit in Pune.',
    status: 'rejected',
    note: 'Please attach an itemised receipt.'
  },
  {
    title: 'Team offsite train tickets',
    category: 'Travel',
    date: '2026-11-03',
    amount: 4240,
    reason: 'Return train tickets for the quarterly team offsite.',
    status: 'approved',
    note: 'Approved.'
  }
];

const zoya = db.prepare("SELECT id FROM users WHERE email = 'zoya.mir@ubhar.company'").get();
const zoyaClaims = db.prepare('SELECT COUNT(*) AS total FROM claims WHERE user_id = ?').get(zoya.id);

if (zoyaClaims.total === 0) {
  for (let i = claims.length - 1; i >= 0; i--) {
    const claim = claims[i];
    db.prepare(`
      INSERT INTO claims (user_id, title, category, expense_date, amount, reason, status, review_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(zoya.id, claim.title, claim.category, claim.date, claim.amount, claim.reason, claim.status, claim.note, claim.date + ' 10:00:00');
  }
  console.log('Added ' + claims.length + ' demo claims for Zoya Mir.');
}

console.log('Added ' + added + ' demo account(s) to Ubhar. Password for all: ' + PASSWORD);
console.log('Sign in at http://localhost:3000/sign-in');
