const bcrypt = require('bcryptjs');
const db = require('./db.js');

const PASSWORD = 'finpulse123';

const people = [
  {
    name: 'Tanushree Bhowmik',
    email: 'tanushree.bhowmik@ubhar.company',
    role: 'finance',
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
    name: 'Arnav Kulkarni',
    email: 'arnav.kulkarni@ubhar.company',
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
    title: 'Employee'
  },
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

const zoyaClaims = [
  {
    title: 'Taxi to the Andheri client office',
    category: 'Local transport',
    date: '2026-06-05',
    amount: 640,
    reason: 'Taxi to the Andheri office for the first client meeting.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Notebooks and stationery',
    category: 'Office supplies',
    date: '2026-06-12',
    amount: 1150,
    reason: 'Notebooks and pens for the client workshop.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Team lunch after the launch',
    category: 'Meals & entertainment',
    date: '2026-06-24',
    amount: 1820,
    reason: 'Lunch for the design team after the June launch.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Flight to Delhi',
    category: 'Travel',
    date: '2026-07-08',
    amount: 5980,
    reason: 'Return flight to Delhi for the Kaveri Foods kick-off meeting.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Hotel in Delhi',
    category: 'Accommodation',
    date: '2026-07-09',
    amount: 3200,
    reason: 'One night near the client office in Delhi.',
    status: 'approved',
    note: 'Approved. Within the hotel limit.'
  },
  {
    title: 'Airport metro',
    category: 'Local transport',
    date: '2026-07-10',
    amount: 120,
    reason: 'Metro from Delhi airport to the client office.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Online UX course',
    category: 'Training',
    date: '2026-08-04',
    amount: 2499,
    reason: 'Online course on usability testing for the onboarding project.',
    status: 'approved',
    note: 'Approved. Share what you learn with the team.'
  },
  {
    title: 'Client coffee meeting',
    category: 'Meals & entertainment',
    date: '2026-08-13',
    amount: 460,
    reason: 'Coffee with the Kaveri Foods product lead.',
    status: 'rejected',
    note: 'Please attach the bill.'
  },
  {
    title: 'Printer cartridges',
    category: 'Office supplies',
    date: '2026-08-21',
    amount: 1890,
    reason: 'Cartridges for the studio printer.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Train to Pune for the workshop',
    category: 'Travel',
    date: '2026-09-02',
    amount: 1450,
    reason: 'Return train tickets for the Pune client workshop.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Hotel in Pune',
    category: 'Accommodation',
    date: '2026-09-03',
    amount: 4600,
    reason: 'Two nights near the client office for the workshop.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Workshop dinner with the client',
    category: 'Meals & entertainment',
    date: '2026-09-04',
    amount: 2310,
    reason: 'Dinner with the client team after the first workshop day.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Cabs in Pune',
    category: 'Local transport',
    date: '2026-09-05',
    amount: 980,
    reason: 'Cabs between the hotel and the client office.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Notion team plan',
    category: 'Software & tools',
    date: '2026-10-06',
    amount: 1600,
    reason: 'Notion plan for the project notes shared with the client.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Diwali client gifts',
    category: 'Other',
    date: '2026-10-17',
    amount: 3500,
    reason: 'Sweets boxes for the client team for Diwali.',
    status: 'rejected',
    note: 'Client gifts need approval before you buy them.'
  },
  {
    title: 'Cab to the airport',
    category: 'Local transport',
    date: '2026-10-28',
    amount: 720,
    reason: 'Early morning cab to the airport for the Bengaluru trip.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    title: 'Team offsite train tickets',
    category: 'Travel',
    date: '2026-11-03',
    amount: 4240,
    reason: 'Return train tickets for the quarterly team offsite.',
    status: 'approved',
    note: 'Approved.'
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
    title: 'Design conference',
    category: 'Training',
    date: '2026-11-10',
    amount: 6500,
    reason: 'Ticket for the Bengaluru design systems conference.',
    status: 'approved',
    note: 'Approved. Relevant to your team\'s work.'
  },
  {
    title: 'Client lunch',
    category: 'Meals & entertainment',
    date: '2026-11-14',
    amount: 1285.50,
    reason: 'Lunch with the Kaveri Foods team to review the new onboarding plan.',
    status: 'pending',
    note: null
  }
];

const teamClaims = [
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Stock photos for the landing page',
    category: 'Software & tools',
    date: '2026-06-09',
    amount: 900,
    reason: 'Licensed photos for the new onboarding landing page.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Filing folders and labels',
    category: 'Office supplies',
    date: '2026-06-11',
    amount: 640,
    reason: 'Folders and labels for the new invoice filing system.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Train to the Lonavala site',
    category: 'Travel',
    date: '2026-06-16',
    amount: 760,
    reason: 'Return train tickets for the Lonavala site visit.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-06-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Bus to the Navi Mumbai site',
    category: 'Local transport',
    date: '2026-06-20',
    amount: 380,
    reason: 'Bus tickets for the site visit with the client.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Client workshop snacks',
    category: 'Meals & entertainment',
    date: '2026-07-15',
    amount: 1350,
    reason: 'Snacks and tea for the half day client workshop.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-07-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Contract printing',
    category: 'Office supplies',
    date: '2026-07-22',
    amount: 1240,
    reason: 'Printing and binding the signed client contracts.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Client visit in Thane',
    category: 'Local transport',
    date: '2026-07-29',
    amount: 560,
    reason: 'Cab to the client office in Thane and back.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Tally software renewal',
    category: 'Software & tools',
    date: '2026-08-03',
    amount: 4500,
    reason: 'Yearly renewal of the accounting software.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Client lunch in Thane',
    category: 'Meals & entertainment',
    date: '2026-08-07',
    amount: 1680,
    reason: 'Lunch with the Thane client before the contract review.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Cabs in Thane',
    category: 'Local transport',
    date: '2026-08-07',
    amount: 640,
    reason: 'Cabs between the station and the client office.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Flight to Bengaluru',
    category: 'Travel',
    date: '2026-08-11',
    amount: 6200,
    reason: 'Return flight for the Bengaluru partner meeting.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Hotel in Bengaluru',
    category: 'Accommodation',
    date: '2026-08-12',
    amount: 3800,
    reason: 'One night near the partner office.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-08-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Usability testing gift cards',
    category: 'Other',
    date: '2026-08-26',
    amount: 3000,
    reason: 'Gift cards for the six people in the usability tests.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Accounting workshop',
    category: 'Training',
    date: '2026-09-09',
    amount: 3000,
    reason: 'One day GST filing workshop.',
    status: 'approved',
    note: 'Approved. Useful for the quarter end.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Hotel near the Pune site',
    category: 'Accommodation',
    date: '2026-09-16',
    amount: 2800,
    reason: 'One night near the Pune site for the early inspection.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Cab to Pune airport',
    category: 'Local transport',
    date: '2026-09-17',
    amount: 950,
    reason: 'Cab from the Pune site to the airport.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-09-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Dinner with the client team',
    category: 'Meals & entertainment',
    date: '2026-09-24',
    amount: 2750,
    reason: 'Dinner after the Thane contract signing.',
    status: 'rejected',
    note: 'Dinners over 2,000 need approval before the event.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Train to Nashik',
    category: 'Travel',
    date: '2026-10-08',
    amount: 890,
    reason: 'Train tickets for the Nashik warehouse visit.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Design meetup ticket',
    category: 'Training',
    date: '2026-10-10',
    amount: 1200,
    reason: 'Ticket for the Mumbai design meetup.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Desk lamp and cables',
    category: 'Office supplies',
    date: '2026-10-15',
    amount: 1450,
    reason: 'Lamp and cables for the new finance desk.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-10-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Cabs for the Pune event',
    category: 'Local transport',
    date: '2026-10-21',
    amount: 1180,
    reason: 'Cabs between the station, hotel and event.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Sketchbooks and markers',
    category: 'Office supplies',
    date: '2026-11-05',
    amount: 760,
    reason: 'Sketchbooks and markers for the design sprint.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'pranjal.bora@ubhar.company',
    title: 'Printer paper and ink',
    category: 'Office supplies',
    date: '2026-11-08',
    amount: 980,
    reason: 'Paper and ink for printing the quarterly contracts.',
    status: 'approved',
    note: 'Approved.'
  },
  {
    email: 'lalrinpuii.ralte@ubhar.company',
    title: 'Hotel stay in Pune',
    category: 'Accommodation',
    date: '2026-11-16',
    amount: 5400,
    reason: 'Two nights near the client office for the Pune workshop.',
    status: 'manager_approved',
    note: 'Approved. Within the hotel limit.'
  },
  {
    email: 'siddhesh.parab@ubhar.company',
    title: 'Figma licence',
    category: 'Software & tools',
    date: '2026-11-18',
    amount: 1500,
    reason: 'Monthly Figma seat for the new onboarding designs.',
    status: 'pending',
    note: null
  },
  {
    email: 'rinchen.bhutia@ubhar.company',
    title: 'Taxi to client office',
    category: 'Local transport',
    date: '2026-11-19',
    amount: 420,
    reason: 'Taxi to the Kaveri Foods office for the contract signing.',
    status: 'pending',
    note: null
  }
];

function addClaim(userId, claim) {
  db.prepare(`
    INSERT INTO claims (user_id, title, category, expense_date, amount, reason, status, review_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, claim.title, claim.category, claim.date, claim.amount, claim.reason, claim.status, claim.note, claim.date + ' 10:00:00');
}

function claimExists(userId, claim) {
  const existing = db.prepare(`
    SELECT id FROM claims
    WHERE user_id = ? AND title = ? AND expense_date = ?
  `).get(userId, claim.title, claim.date);
  if (existing) {
    return true;
  }
  return false;
}

const teams = [
  { manager: 'harjot.dhillon@ubhar.company', employee: 'zoya.mir@ubhar.company' },
  { manager: 'harjot.dhillon@ubhar.company', employee: 'siddhesh.parab@ubhar.company' },
  { manager: 'harjot.dhillon@ubhar.company', employee: 'rinchen.bhutia@ubhar.company' },
  { manager: 'arnav.kulkarni@ubhar.company', employee: 'lalrinpuii.ralte@ubhar.company' },
  { manager: 'arnav.kulkarni@ubhar.company', employee: 'pranjal.bora@ubhar.company' }
];

for (let i = 0; i < teams.length; i++) {
  const manager = db.prepare('SELECT id FROM users WHERE email = ?').get(teams[i].manager);
  db.prepare(`
    UPDATE users
    SET manager_id = ?
    WHERE email = ? AND role = 'employee' AND manager_id IS NULL
  `).run(manager.id, teams[i].employee);
}

const zoya = db.prepare("SELECT id FROM users WHERE email = 'zoya.mir@ubhar.company'").get();
let zoyaAdded = 0;
for (let i = 0; i < zoyaClaims.length; i++) {
  if (!claimExists(zoya.id, zoyaClaims[i])) {
    addClaim(zoya.id, zoyaClaims[i]);
    zoyaAdded = zoyaAdded + 1;
  }
}
if (zoyaAdded > 0) {
  console.log('Added ' + zoyaAdded + ' demo claims for Zoya Mir.');
}

let teamAdded = 0;
for (let i = 0; i < teamClaims.length; i++) {
  const person = db.prepare('SELECT id FROM users WHERE email = ?').get(teamClaims[i].email);
  if (!claimExists(person.id, teamClaims[i])) {
    addClaim(person.id, teamClaims[i]);
    teamAdded = teamAdded + 1;
  }
}
if (teamAdded > 0) {
  console.log('Added ' + teamAdded + ' demo claims for the rest of the team.');
}

console.log('Added ' + added + ' demo account(s) to Ubhar. Password for all: ' + PASSWORD);
console.log('Sign in at http://localhost:3000/sign-in');
