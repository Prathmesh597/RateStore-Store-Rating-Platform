const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { validatePassword } = require("../utils/validate");

//1. Store Owner - Get Dashboard (users who rated + average rating)
const getDashboard = async (req, res) => {
  try {

    //1.  Get logged-in owner's ID
    const ownerId = req.user.id;

    //2. Get store owned by this owner
    const [stores] = await db.query(
      "SELECT id FROM stores WHERE owner_id = ?",
      [ownerId]
    );

    //3.  Owner has no store, Error message
    if (stores.length === 0) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    //4. If found, get First User
    const storeId = stores[0].id;

    //5. Get average rating
    const [[{ avgRating }]] = await db.query(
      "SELECT COALESCE(AVG(rating), 0) as avgRating FROM ratings WHERE store_id = ?",
      [storeId]
    );

    //6. Get all users who rated this store
    const [raters] = await db.query(
      `SELECT u.id, u.name, u.email, r.rating
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?`,
      [storeId]
    );

    //7. Return dashboard data
    res.json({ avgRating, raters });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//2. Store Owner - Update Password
const updatePassword = async (req, res) => {
  try {
    
    //1. Get current password and new password from request body
    const { currentPassword, newPassword } = req.body;

    //2. Get logged-in owner's ID
    const ownerId = req.user.id;

    //3. Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    //4. Get owner's stored password hash from db
    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [ownerId]
    );

    //5. Compare entered current password with stored password hash
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    //6. Password incorrect, Error message
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    //7. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //8. 8. Update password in database
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, ownerId]
    );

    //9. Success response
    res.json({ message: "Password updated successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboard, updatePassword };