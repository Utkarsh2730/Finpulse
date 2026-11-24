# Finpulse

Expense approvals for small teams. This folder holds the Finpulse app. The first part built is accounts and sign-in; the claim screens come next.

## How people get in

1. **A company registers** on the home page (`/`) with its name, the admin's name, team size, work email and password. That person becomes the **company admin** (a manager) and is signed in straight away.
2. **The admin adds the team** from the Manager portal:
   - One person at a time with the **Add a person** form: name, job title, work email, role (employee or manager) and a password the admin types in.
3. **Everyone signs in at `/sign-in`** with their work email and password. The account's role decides where they land: employees in the Employee portal, managers in the Manager portal.

## Tech stack

| Part | Tool |
| --- | --- |
| Pages | HTML, CSS and plain JavaScript |
| Server | Node.js with Express |
| Signed-in sessions | `express-session` (a cookie) |
| Database | SQLite, using Node's built-in `node:sqlite` |
| Passwords | bcrypt (the `bcryptjs` package), stored only as hashes |
| Active profile | `localStorage` (`finpulse.profile`) |

## Run it

You need Node.js 22.13 or newer.

```bash
npm install
npm run seed
npm start
```

Then open http://localhost:3000. `npm run seed` adds the demo team from the Figma wireframe.

`npm run dev` restarts the server automatically when you change a server file. Sessions are kept in memory, so restarting the server signs everyone out.

The home page shows a picture of the Manager portal. Export the "Finpulse · Manager portal" frame from Figma as PNG and save it as `code/public/assets/manager-portal.png`. Until then that section stays hidden.

## Demo accounts

Run `npm run seed` once to add the demo company **Ubhar** and its team from the Figma wireframe. Then sign in at http://localhost:3000/sign-in.

Quickest accounts to try:

- **Admin (Manager portal with team tools):** `tanushree.bhowmik@ubhar.company` / `finpulse123`
- **Manager:** `harjot.dhillon@ubhar.company` / `finpulse123`
- **Employee:** `zoya.mir@ubhar.company` / `finpulse123`

| Person | Email | Password | Role | Lands in |
| --- | --- | --- | --- | --- |
| Tanushree Bhowmik | tanushree.bhowmik@ubhar.company | finpulse123 | Manager, company admin (Finance manager) | Manager portal, with the team tools |
| Harjot Dhillon | harjot.dhillon@ubhar.company | finpulse123 | Manager | Manager portal |
| Siddhesh Parab | siddhesh.parab@ubhar.company | finpulse123 | Employee (Product designer) | Employee portal |
| Lalrinpuii Ralte | lalrinpuii.ralte@ubhar.company | finpulse123 | Employee | Employee portal |
| Pranjal Bora | pranjal.bora@ubhar.company | finpulse123 | Employee | Employee portal |
| Zoya Mir | zoya.mir@ubhar.company | finpulse123 | Employee | Employee portal |
| Rinchen Bhutia | rinchen.bhutia@ubhar.company | finpulse123 | Employee | Employee portal |

These passwords are for the demo only. The database stores them as bcrypt hashes, never as plain text.

## Project structure

All the code is in the `code` folder. The package files and the database sit next to it.

```
code/
  server/
    index.js   Express server, session setup, and the pages in public/
    db.js      SQLite tables: companies, users and claims
    auth.js    Register, sign in, sign out, who is signed in, and the admin's team tools
    claims.js  Expense claims: list, submit, save and finish drafts
    seed.js    Demo company Ubhar, its team and a few claims for Zoya Mir
  public/
    html/index.html     Home page: company registration (Figma "Company sign up")
    html/sign-in.html   Sign in for everyone
    html/employee.html  Employee portal: My expenses (Figma "Employee portal")
    html/manager.html   Manager portal (signed-in page for now; the admin also adds people here)
    css/styles.css      Styles for the home page and the manager portal
    css/employee.css    Styles for the employee portal
    css/sign-in.css     Styles for the sign-in page
    js/register.js      Registration form
    js/sign-in.js       Sign-in form
    js/portal.js        Shared portal code: who is signed in, sign out, the admin's team tools
    js/employee.js      Employee portal: stats, new claim form, drafts and recent claims
data/finpulse.db  The database file (created on first run, not committed)
package.json      Scripts and packages
```

## API

| Method and address | Who | Purpose |
| --- | --- | --- |
| POST /api/companies | Anyone | Register a company and its admin; signs the admin in |
| POST /api/signin | Anyone | Check email and password; returns the person, whose role picks the portal |
| POST /api/signout | Signed in | Sign out |
| GET /api/me | Signed in | The signed-in person and their company |
| GET /api/team | Company admin | People in the company |
| POST /api/team/people | Company admin | Add an employee or manager with a password the admin chooses |
| POST /api/team/password | Company admin | Reset the password of someone in the company |
| GET /api/claims | Signed in | Your own claims, newest first |
| POST /api/claims | Signed in | Submit a claim, or save it as a draft |
| POST /api/claims/:id | Signed in | Change or submit one of your drafts |

## Team

Utkarsh Sonthalia and Ayesha Aftab Shams.
