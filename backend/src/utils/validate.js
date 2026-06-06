//1. Name Validation
// name > 20 and name < 60
const validateName = (name) =>{
    if(!name || name.length < 20 || name.length > 60){
        return "Name must be between 20 and 60 characters";
    }
    return null; // no error
}

//2. Email Validation
// format -> john@gmail.com, must include alphabates, special character
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) { // compare user input email with pattern, return true/false
    return "Invalid email format";
  }
  return null;
};

//3. validate password
// must include -> 8-16 chars, min one uppercase, one special character
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return "Password must be 8-16 characters with at least one uppercase letter and one special character";
  }
  return null;
};


//4. Address validation
// max 400 characters including space
const validateAddress = (address) => {
  if (!address || address.length > 400) {
    return "Address must not exceed 400 characters";
  }
  return null;
};

//5. Star Rating Validation
// Rating must be between 1 and 5
const validateRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }
  return null;
};


//6. Export all methods
module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
};