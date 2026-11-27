# Finpulse

Expense approvals for small teams. Employees submit claims, a manager approves them, then a finance manager gives the final approval.

## How people get in

1. **A company registers** on the home page (`/`) with its name, the admin's name, team size, work email and password. That person becomes the **company admin** (a manager) and is signed in straight away.
2. **The admin adds the team** from the Team page:
   - One person at a time with the **Add a person** form on the Team page: name, job title, work email, role (employee, manager or finance manager) and a password the admin types in.
   - The admin can change anyone's role later from the dropdown next to their name. The admin cannot change their own role, so the company never loses its admin.
   - The admin resets other people's passwords without knowing the old one. For their own password they use **Change password**, which asks for the current password first. So someone who finds the admin signed in cannot lock the admin out.
3. **Everyone signs in at `/sign-in`** with their work email and password. The account's role decides where they land: employees in the Employee portal, managers in the Manager portal, finance managers in the Finance portal.

## How a claim is approved

| Step | Who | Status after it |
| --- | --- | --- |
| Submit the claim | Employee | `pending` (Pending) |
| First check | Manager | `manager_approved` (With finance), or `rejected` with a note |
| Final check | Finance manager | `approved`, or `rejected` with a note |

The finance manager sees the manager's note next to each claim. The employee sees every status change and the note of whoever rejected the claim.

### Manager teams

A company can have several managers. On the Team page the admin picks who each employee **reports to**.

- A manager sees and reviews claims only from their own team.
- Employees with no manager yet are visible to every manager, so no claim gets stuck.
- The finance manager sees claims from every team.
- If a manager is given another role, their team has no manager until the admin picks a new one.

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

- **Finance manager and admin (Finance portal with team tools):** `tanushree.bhowmik@ubhar.company` / `finpulse123`
- **Manager:** `harjot.dhillon@ubhar.company` / `finpulse123`
- **Employee:** `zoya.mir@ubhar.company` / `finpulse123`

| Person | Email | Password | Role | Lands in |
| --- | --- | --- | --- | --- |
| Tanushree Bhowmik | tanushree.bhowmik@ubhar.company | finpulse123 | Finance manager, company admin | Finance portal, with the team tools |
| Harjot Dhillon | harjot.dhillon@ubhar.company | finpulse123 | Manager of Siddhesh, Zoya and Rinchen | Manager portal |
| Arnav Kulkarni | arnav.kulkarni@ubhar.company | finpulse123 | Manager of Lalrinpuii and Pranjal | Manager portal |
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
    review.js  Manager and finance review: team claims, receipts, approve and reject
    seed.js    Demo company Ubhar, its team, six months of claims (June to November 2026) and claims to review
  public/
    html/index.html     Home page: company registration (Figma "Company sign up")
    html/sign-in.html   Sign in for everyone
    html/employee.html  Employee portal: My expenses (Figma "Employee portal")
    html/overview.html  Employee portal: Overview (claims that need attention, latest activity)
    html/reports.html   Employee portal: Reports (month chart, categories, claims table, CSV download)
    html/manager.html   Manager portal: Approvals (review queue, approve or reject with a note)
    html/finance.html   Finance portal: Approvals (claims managers approved, final decision)
    html/company-reports.html Finance portal: Reports (company spend by month, each employee by month)
    html/all-claims.html Manager and finance: All claims (filter by person and status, CSV download)
    html/team.html      Manager and finance: Team (admin adds people, changes roles, picks managers, resets passwords)
    css/styles.css      Styles for the home page
    css/employee.css    Styles for the portal pages (employee and manager)
    css/manager.css     Extra styles for the manager and finance pages
    css/sign-in.css     Styles for the sign-in page
    js/register.js      Registration form
    js/sign-in.js       Sign-in form
    js/portal.js        Shared portal code: who is signed in, sign out, notifications, help
    js/helpers.js       Shared helpers for the portal pages: money, dates, badges
    js/employee.js      My expenses: stats, new claim form, drafts and recent claims
    js/overview.js      Overview page
    js/reports.js       Reports page
    js/approvals.js     Approvals page for managers and finance
    js/all-claims.js    All claims page
    js/company-reports.js Finance reports: month bar chart, employee by month table, CSV
    js/team.js          Team page: add people, change roles, reset passwords, change your own password
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
| POST /api/team/password | Company admin | Reset the password of someone else in the company |
| POST /api/me/password | Signed in | Change your own password; needs your current password |
| POST /api/team/role | Company admin | Change someone's role to employee, manager or finance manager (not their own) |
| POST /api/team/manager | Company admin | Pick which manager an employee reports to, or none |
| GET /api/claims | Signed in | Your own claims, newest first |
| POST /api/claims | Signed in | Submit a claim, or save it as a draft |
| POST /api/claims/:id | Signed in | Change or submit one of your drafts |
| GET /api/review/claims | Manager or finance | Submitted claims with who sent them: a manager gets their own team and anyone with no manager, finance gets everyone |
| GET /api/review/claims/:id/receipt | Manager or finance | Open the receipt file of a claim |
| POST /api/review/claims/:id | Manager or finance | Approve or reject a claim waiting for you; a rejection needs a note |

## Team

Utkarsh Sonthalia and Ayesha Aftab Shams.
