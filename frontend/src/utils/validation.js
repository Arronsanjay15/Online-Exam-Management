// =============================================
// INPUT VALIDATION
//
// Shared rules for the app's forms. Each rule mirrors the
// real-world use case of its field, so obviously wrong data
// (a 4-digit phone number, a broken email, an empty name) is
// caught in the browser before it ever reaches the API.
//
// The same field is also given matching `maxLength` /
// `inputMode` attributes in the forms so the input box itself
// helps guide the user while typing.
// =============================================

export const PASSWORD_MIN_LENGTH = 6;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const PHONE_LENGTH = 10;

export const EMAIL_MAX_LENGTH = 254;

// something@something.tld (at least two letters in the suffix)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Digits only, exactly 10 (e.g. a mobile number).
const PHONE_PATTERN = /^[0-9]{10}$/;

// Letters, numbers, dot, underscore and hyphen.
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

// A person's name: 2-60 characters and at least one letter,
// which also accepts the names auto-created from usernames.
const NAME_HAS_LETTER = /\p{L}/u;


export function isValidEmail(value) {
    const email = String(value).trim();
    return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}


export function isValidPhone(value) {
    return PHONE_PATTERN.test(String(value).trim());
}


export function isValidUsername(value) {
    return USERNAME_PATTERN.test(String(value).trim());
}


export function isValidName(value) {
    const name = String(value).trim();

    if (
        name.length < NAME_MIN_LENGTH ||
        name.length > NAME_MAX_LENGTH
    ) {
        return false;
    }

    return NAME_HAS_LETTER.test(name);
}


export function isValidPassword(value) {
    return String(value).length >= PASSWORD_MIN_LENGTH;
}


// Keeps only digits and caps the length. Used while typing a
// phone number so a stray letter or a 12th digit is dropped
// immediately instead of being submitted.
export function sanitizePhone(value) {
    return String(value).replace(/\D/g, "").slice(0, PHONE_LENGTH);
}


// Keeps only digits. Used for numeric text fields where a
// pasted value could otherwise contain letters or symbols.
export function sanitizeDigits(value) {
    return String(value).replace(/\D/g, "");
}
