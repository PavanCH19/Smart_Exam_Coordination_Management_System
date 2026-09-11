const bcrypt = require("bcrypt");

const password = "Admin@123";

const app = async () =>{
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
}

app();