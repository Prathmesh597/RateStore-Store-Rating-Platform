const bcrypt = require("bcryptjs");
const db = require("./db");


//1. see admin credentials
const seedAdmin = async () => {

    try{

        //1. check if ADMIN role exists in db
        const[existingAdmin] = await db.query(
            "select id from users where role = ?", ["admin"]
        );

        //2. if exists, ERROR message
        if(existingAdmin.length > 0){
            console.log("Admin already exists.");
            return;
        }

        //3. If NOT exists, convert raw password -> hashed password, upto 10 salt iteration
        const hashedPassword = await bcrypt.hash("Admin@1234",10);

        //4. insert into db
        await db.query(
            "insert into users(name, email, password, address,role)values(?,?,?,?,?)",[
                "System Administrator",
                "admin@roxiler.com",
                hashedPassword,
                "Roxiler Systems, Baner, Pune, Maharashtra",
                "admin",
            ]
        );

        //5. display success message
        console.log("Default admin created successfully");
        console.log("Email: admin@roxiler.com");
        console.log("Password: Admin@1234");

    }catch(error){
            console.error("faild to seed admin credentials", error.message);
    }
}; 

//6. exxport seedAdmin function
module.exports = seedAdmin;