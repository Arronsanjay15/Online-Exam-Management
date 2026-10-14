// =============================================
// SERVER-SIDE VALIDATION
//
// Mirrors the rules enforced by the frontend forms so the API
// rejects the same bad data even when it is called directly
// (for example with Postman). Kept dependency-free on purpose.
// =============================================

const PASSWORD_MIN_LENGTH = 6;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 60;

const EMAIL_MAX_LENGTH = 254;

const GENDERS = ["Male", "Female", "Other"];

// something@something.tld (at least two letters in the suffix)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Digits only, exactly 10 (e.g. a mobile number).
const PHONE_PATTERN = /^[0-9]{10}$/;

// Letters, numbers, dot, underscore and hyphen.
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

// A person's name needs at least one letter.
const NAME_HAS_LETTER = /\p{L}/u;


function isValidEmail(value) {
    const email = String(value).trim();
    return (
        email.length > 0 &&
        email.length <= EMAIL_MAX_LENGTH &&
        EMAIL_PATTERN.test(email)
    );
}

function isValidPhone(value) {
    return PHONE_PATTERN.test(String(value).trim());
}

function isValidUsername(value) {
    return USERNAME_PATTERN.test(String(value).trim());
}

function isValidPassword(value) {
    return String(value).length >= PASSWORD_MIN_LENGTH;
}

function isValidName(value) {
    const name = String(value).trim();

    if (
        name.length < NAME_MIN_LENGTH ||
        name.length > NAME_MAX_LENGTH
    ) {
        return false;
    }

    return NAME_HAS_LETTER.test(name);
}

function isValidGender(value) {
    return GENDERS.includes(String(value).trim());
}


// Validates only the profile fields that were actually provided,
// so it works for both full (register) and partial (update) data.
// Returns an array of human-readable problems.
function validateProfileFields(fields = {}) {
    const errors = [];

    if (fields.name !== undefined && !isValidName(fields.name)) {
        errors.push("Please enter a valid name (2-60 characters)");
    }

    if (fields.email !== undefined && !isValidEmail(fields.email)) {
        errors.push("Please enter a valid email address");
    }

    if (
        fields.phoneNumber !== undefined &&
        !isValidPhone(fields.phoneNumber)
    ) {
        errors.push("Phone number must be exactly 10 digits");
    }

    if (fields.gender !== undefined && !isValidGender(fields.gender)) {
        errors.push("Please select a valid gender");
    }

    return errors;
}


module.exports = {
    PASSWORD_MIN_LENGTH,
    isValidEmail,
    isValidPhone,
    isValidUsername,
    isValidPassword,
    isValidName,
    isValidGender,
    validateProfileFields
};
