const bcrypt = require("bcrypt");

const password = "Admin@123";

const app = async () =>{
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
}

app();


// INSERT INTO users
// (name, email, password, role, status, student_id, employee_id, created_at, updated_at)
// VALUES
// (
//     'Admin',
//     'admin@gmail.com',
//     '$2b$10$GY/Ks3L79sMQhzjOFpAIfOIU2FIiwxru81Lg7W.g85UlJVuIuZtYS',
//     'ADMIN',
//     'ACTIVE',
//     NULL,
//     NULL,
//     NOW(),
//     NOW()
// );