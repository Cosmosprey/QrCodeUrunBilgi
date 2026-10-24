// Small helpers for building DOM safely. Product data must never be put into innerHTML;
// build elements with these helpers so values are always inserted as plain text.

/**
 * Creates an element.
 * options: { className, text, attrs: {name: value}, on: {event: handler} }
 * children: array of Nodes and/or strings (strings become text nodes).
 */
export function el(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;
    for (const [name, value] of Object.entries(options.attrs ?? {})) {
        node.setAttribute(name, value);
    }
    for (const [event, handler] of Object.entries(options.on ?? {})) {
        node.addEventListener(event, handler);
    }
    node.append(...children);
    return node;
}

/** Returns the value only when it is an http(s) URL, otherwise an empty string. */
export function safeHttpUrl(value) {
    if (typeof value !== "string") return "";
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? value : "";
    } catch {
        return "";
    }
}
