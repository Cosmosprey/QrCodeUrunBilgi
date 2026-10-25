// Login screen and sign-in state of the admin panel.

import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "./firebase-admin.js";
import { usernameToEmail } from "./username.js";
import { showMessage } from "./ui.js";

const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-btn");
const loginSpinner = document.getElementById("login-spinner");
const passwordInput = document.getElementById("login-password");

function loginErrorKey(err) {
    switch (err?.code) {
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-email":
            return "login.error.credentials";
        case "auth/too-many-requests":
            return "login.error.tooMany";
        case "auth/network-request-failed":
            return "login.error.network";
        default:
            return "login.error.other";
    }
}

/** Signs out and explains why (a translation key) on the login screen, e.g. when an account has no admin rights. */
export async function signOutWithMessage(messageKey) {
    await signOut(auth);
    showMessage(loginError, messageKey);
}

/**
 * Wires the login form and the logout button. The panel is only shown (and data only requested)
 * while someone is signed in. What a signed-in user may actually do is decided by the Firestore
 * and Storage rules, not here.
 */
export function initAuthUi({ onSignedIn, onSignedOut }) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showMessage(loginError, "");

        const email = usernameToEmail(document.getElementById("login-username").value);
        const password = passwordInput.value;
        if (!email || !password) {
            showMessage(loginError, "login.error.credentials");
            return;
        }

        loginButton.disabled = true;
        loginSpinner.classList.remove("d-none");
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            showMessage(loginError, loginErrorKey(err));
        } finally {
            loginButton.disabled = false;
            loginSpinner.classList.add("d-none");
        }
    });

    document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginView.classList.add("d-none");
            appView.classList.remove("d-none");
            onSignedIn();
        } else {
            appView.classList.add("d-none");
            loginView.classList.remove("d-none");
            passwordInput.value = "";
            onSignedOut();
        }
    });
}
