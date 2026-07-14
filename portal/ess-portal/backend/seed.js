const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'database', 'db.json');

async function seed() {
  const db = {
    employees: [],
    departments: [],
    attendance: [],
    leaves: [],
    payroll: [],
    payslips: [],
    performance: [],
    tasks: [],
    announcements: [],
    training: [],
    tickets: [],
    assets: []
  };

  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('emp123', 10);

  db.employees.push({
    id: '1',
    name: 'System Admin',
    email: 'admin@company.com',
    password: adminPassword,
    role: 'System Administrator',
    joining_date: new Date().toISOString(),
    status: 'Active'
  });

  db.employees.push({
    id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    password: employeePassword,
    role: 'Employee',
    joining_date: new Date().toISOString(),
    status: 'Active'
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('Database seeded successfully!');
}

seed();
