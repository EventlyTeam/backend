
function validateEmail(email) {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(username)
}

/*
    Password rules (at least):
    - 10 characters length
    - 2 letters in uppercase
    - 1 special character
    - 2 numerals (0-9)
    - 3 letters in lowercase
*/

function validatePassword(password) {
    const passwordRegex = /^(?=(.*[a-z]){3})(?=(.*[A-Z]){2})(?=(.*\d){2})(?=.*[\W_]).{10,}$/;
    return passwordRegex.test(password)
}

module.exports = validateEmail, validatePassword;