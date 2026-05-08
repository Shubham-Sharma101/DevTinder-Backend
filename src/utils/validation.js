const validator = require('validator');

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Name is not valid!")
    } else if (firstName.length < 4 || firstName.length > 50) {
        throw new Error("Name is not valid!")
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password!")
    }
}
const validateEditProfileData = function (req) {
    const allowedEditFields = ["firstName", "lastName", "emailId", "gender", "about", "skills", "age", "photoUrl"]
    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field))
    return isEditAllowed
}
module.exports = { validateSignUpData, validateEditProfileData }