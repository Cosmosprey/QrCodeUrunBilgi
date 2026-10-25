// Pure parts of the translation system (no DOM, no storage): picking the language and filling in texts.

export const LANGUAGES = ["tr", "en"];

/**
 * The language to start in: the saved choice if there is one, otherwise the browser's first preferred
 * language (Turkish if it is Turkish, English for anything else). With no information at all, Turkish.
 */
export function detectLanguage({ saved, browserLanguages = [] } = {}) {
    if (LANGUAGES.includes(saved)) return saved;
    const first = browserLanguages.find(Boolean);
    if (!first) return "tr";
    return String(first).toLowerCase().startsWith("tr") ? "tr" : "en";
}

/** The Intl locale used to format numbers and dates in a language. */
export function intlLocale(language) {
    return language === "en" ? "en-GB" : "tr-TR";
}

/** Replaces {name} in a text with params.name; an unknown {name} is left as it is. */
export function interpolate(template, params = {}) {
    return template.replace(/\{(\w+)\}/g, (placeholder, name) => (Object.hasOwn(params, name) ? String(params[name]) : placeholder));
}

/** The text for a key. With params.count === 1 the singular variant "key.one" is used when the dictionary has one. */
export function translate(dictionary, key, params = {}) {
    const useSingular = params.count === 1 && Object.hasOwn(dictionary, `${key}.one`);
    const template = dictionary[useSingular ? `${key}.one` : key];
    // A missing key shows up as the key itself, which makes it easy to spot (and a test fails on it).
    return typeof template === "string" ? interpolate(template, params) : key;
}

/**
 * Like translate, but returns a list of pieces so a parameter can be a DOM node (a badge, bold text):
 * "kasada {code} koduyla" -> ["kasada ", <span>, " koduyla"]. Parameters that are not nodes become text.
 */
export function translateParts(dictionary, key, params = {}) {
    const template = translate(dictionary, key, { count: params.count });
    if (template === key) return [key];
    return template.split(/(\{\w+\})/).filter((piece) => piece !== "").map((piece) => {
        const match = /^\{(\w+)\}$/.exec(piece);
        if (!match || !Object.hasOwn(params, match[1])) return piece;
        const value = params[match[1]];
        return typeof value === "object" && value !== null ? value : String(value);
    });
}
