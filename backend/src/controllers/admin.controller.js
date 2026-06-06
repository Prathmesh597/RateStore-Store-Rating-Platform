const db = require("../config/db");
const bcrypt = require("bcryptjs");

// import validation functions
const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} = require("../utils/validate");

//1. Admin - Display Dashboard
// Dashboard -> total users, total stores, total ratings count
const getDashboard = async (req,res) => {

    try{

        //1. Count total users from users table, excluding admin
        const [[{totalUsers}]] = await db.query(
            "select count(*) as totalUsers from users where role != ?",["admin"]
        );

        //2. Count total stores from stores table
        const [[{ totalStores }]] = await db.query(
            "SELECT COUNT(*) as totalStores FROM stores"
        );

        //3. Count ratings from ratings table
        const [[{ totalRatings }]] = await db.query(
            "SELECT COUNT(*) as totalRatings FROM ratings"
        );

        //4. return as json format
        res.json({ totalUsers, totalStores, totalRatings });


    }catch(error){
        res.status(500).json({message: "Failed to Display Dashboard!!", error: error.message});
    }

};


//2. Admin - Add New User
// vallidate inputes
const addUser = async (req, res) => {

    try{

        //1. Request body
        const { name, email, password, address, role } = req.body;

        //2. Validate inputs
            //2.1 validate Name
        const nameError = validateName(name);
        if(nameError) return res.status(400).json({message: nameError});

            //2.2 validate Email
        const emailError = validateEmail(email);
        if (emailError) return res.status(400).json({ message: emailError });

            //2.3 validate Password
        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ message: passwordError });

            //2.4 validate Address
        const addressError = validateAddress(address);
        if (addressError) return res.status(400).json({ message: addressError });

            //2.5 validate Roles
        const validRoles = ["admin", "user", "store_owner"];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        //3. If all validation passes -> Check for duplicate email
        const[existingUser] = await db.query(
            "select id from users where email = ?",[email]
        );
        
        //4. if email exists, Error message
        if(existingUser.length > 0){
             return res.status(400).json({ message: "Email already registered" });
        }

        //5. Convert raw password -> hashed password, using salting upto 10 iterations
        const hashedPassword = await bcrypt.hash(password, 10)

        //6. add valid user with hashed password into db
        await db.query(
            "insert into users(name, email, password, address, role) values(?,?,?,?,?)",[
                name,
                email,
                hashedPassword,
                address,
                role
            ],
        );

        //7.success message
        res.status(201).json({ message: "User created successfully" });


    }catch(error){
        res.status(500).json({ message: "Failed to add user", error: error.message });
    }

};

//3. Admin - Get All Users with filters
// Filter Users by 'name', 'email', 'address', OR 'role'
// order by 'asc' OR 'desc'
const getUsers = async (req, res) => {

    try{

        //1. query parameters for get users with filters
        const { name, email, address, role, sortBy, order } = req.query;

        //2. base query
        let query = "select id, name, email, address, role from users where 1=1"; //always true; 1=1

        //3.  Empty params array to hold values for ? placeholders
        const params = [];

        //4. Sort by name -> Deafult query + get by name
        if(name){
            query = query + " AND name like ?";
            params.push(`%${name}%`)
        }

        //5. Sort by email -> Deafult query + get by email
        if (email) {
            query = query + " AND email LIKE ?";
            params.push(`%${email}%`);
        }

        //6. Sort by address -> Deafult query + get by address        
        if (address) {
            query = query + " AND address LIKE ?";
            params.push(`%${address}%`);
        }

        //7. Sort by role -> Deafult query + get by role
        if (role) {
            query = query + " AND role = ?";
            params.push(role);
        }
        
        //8. sort by 4 columns
        const validSortFields = ["name", "email", "address", "role"];

        //9. sorting order
        const validOrders = ["asc", "desc"];

        //10. Default Sortfield by 'name'
        let sortField = "name";

        // if not sortby 'name', sort by other fields
        if (validSortFields.includes(sortBy)) {
            sortField = sortBy;
        }

        //11. Default sortOrder by 'asc'
        let sortOrder = "asc";

        //if not sortby 'asc', sort by other fields
        if (validOrders.includes(order?.toLowerCase())) {
            sortOrder = order.toLowerCase();
        }

        //12. Append ORDER BY to query
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        //13. Execute query
        const [users] = await db.query(query, params);
        res.json(users);

        
    }catch(error){
        res.status(500).json({ message: "Failed to retrieve User", error: error.message });
    }
};


//4. Admin - Get Single User by ID
// If user is 'Store-Owner', display avg stores rating
const getUserById = async (req, res) => {
  try {

    // 1. Extract user ID from URL parameter
    const { id } = req.params;

    // 2. Fetch user details from database by id
    const [users] = await db.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [id]
    );

    //3. If user NOT found, Error message
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    //4. If User found, get first user
    const user = users[0];

    //5. Check if this user is a store owner
    if (user.role === "store_owner") {
    
      //6. Calculate average rating of all stores owned by this user
       const [[{ avgRating }]] = await db.query(
        `SELECT COALESCE(AVG(rating), 0) as avgRating
         FROM ratings
         WHERE store_id IN (
           SELECT id
           FROM stores
           WHERE owner_id = ?
         )`,
        [id]
      );

      // 7. Add average rating to user object
      user.avgRating = avgRating;
    }

    // 8. Return user data to client
    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

//5. Admin - Add New Store
// validate inputs
const addStore = async (req, res) => {
  try {

    //1. Request body add store
    const{name, email, address, owner_id} = req.body;

    //2. Validate inputs
        //2.1 validate Name
    const nameError = validateName(name);
    if(nameError) return res.status(400).json({message: nameError});

        //2.2 validate Email
    const emailError = validateEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });

        //2.3 validate Address
    const addressError = validateAddress(address);
    if (addressError) return res.status(400).json({ message: addressError });

    
    //3. If all validation passes -> Check for duplicate email
    const[existingStore] = await db.query(
        "select id from users where email = ?",[email]
    ); 

     //4. if email exists, Error message
    if(existingStore.length > 0){
        return res.status(400).json({ message: "Email already registered" });
    }
    
    //5. Store_id provided || Verify owner if provided
    if(owner_id){
        const[owner] = await db.query(
             "SELECT id FROM users WHERE id = ? AND role = ?", [owner_id, "store_owner"]
        );
        if (owner.length === 0) {
            return res.status(400).json({ message: "Invalid owner. User must have store_owner role" });
        }
    }

        
    //6. add valid Store 
    await db.query(
        "insert into stores(name, email, address, owner_id) values(?,?,?,?)",[
            name,
            email,
            address,
            owner_id || null
        ],
    );

    //7. Success message
    res.status(201).json({ message: "Store created successfully" });

  }catch(error){
    res.status(500).json({ message: "Failed to add store", error: error.message });
  }
}


//6. Admin - Get All Stores with filters
// Average rating of all stores
// sort by 'name', 'email' OR 'address'
// order by 'asc' OR 'desc'
const getStores = async (req, res) => {
  try {

    //1. get query parameters
    const { name, email, address, sortBy, order } = req.query;

    //2. base query -> average rating of stores
    let query = `SELECT s.id, s.name, s.email, s.address, 
                COALESCE(AVG(r.rating), 0) as avgRating
                FROM stores s
                LEFT JOIN ratings r ON s.id = r.store_id
                WHERE 1=1`;

    //3. Empty params array to hold values for ? placeholders
    const params = [];

    //4. sort by name
    if (name) {
      query += " AND s.name LIKE ?";
      params.push(`%${name}%`);
    }

    //5. sort by email
    if (email) {
      query += " AND s.email LIKE ?";
      params.push(`%${email}%`);
    }

    //6. sort by address
    if (address) {
      query += " AND s.address LIKE ?";
      params.push(`%${address}%`);
    }

    //7. groups all rating rows for the same store together
    query += " GROUP BY s.id, s.name, s.email, s.address";

    //8. Default sortby 'name'
    const validSortFields = ["name", "email", "address", "avgRating"];
    
    let sortField = "name";
    if (validSortFields.includes(sortBy)) {
      sortField = sortBy;
    }

    //9. Default orderby 'asc'
    const validOrders = ["asc", "desc"];

    let sortOrder = "asc";
    if (validOrders.includes(order?.toLowerCase())) {
      sortOrder = order.toLowerCase();
    }

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const [stores] = await db.query(query, params);


    res.json(stores);

  } catch (error) {
    res.status(500).json({ message: "Failed to get store", error: error.message });
  }
};

module.exports = {
  getDashboard,
  addUser,
  getUsers,
  getUserById,
  addStore,
  getStores,
};

