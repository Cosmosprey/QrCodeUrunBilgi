// Small helpers shared by the admin panel modules.

/** Shows `message` in an alert element, or hides the element when the message is empty. */
export function showMessage(element, message) {
    element.textContent = message;
    element.classList.toggle("d-none", !message);
}
