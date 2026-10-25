// Firebase Authentication identifies users by e-mail address. The admin panel asks for a plain
// username instead, and maps it to a fixed (non-routable) e-mail domain behind the scenes.
// Consequence: password-reset e-mails do not work; reset the password in the Firebase Console.

export const AUTH_EMAIL_DOMAIN = "qr-admin.local";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

/** Returns the Firebase Auth e-mail for a username, or null when the username is not valid. */
export function usernameToEmail(input) {
    const username = String(input ?? "")
        .trim()
        .toLowerCase();
    if (!USERNAME_PATTERN.test(username)) return null;
    return `${username}@${AUTH_EMAIL_DOMAIN}`;
}
