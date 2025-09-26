
function sanitize_input(value, options = { type: 'text', max_length: 1024 }) {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value !== 'string') {
        value = String(value);
    }
    let sanitized = value.trim();

    // Strip HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove characters often used in SQL injection attempts
    sanitized = sanitized.replace(/['"`;\x00]/g, '');

    // Collapse repeated whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    if (options.type === 'username') {
        sanitized = sanitized.replace(/[^A-Za-z0-9_.-]/g, '');
    } else if (options.type === 'number') {
        sanitized = sanitized.replace(/[^0-9]/g, '');
    } else if (options.type === 'alpha') {
        sanitized = sanitized.replace(/[^A-Za-z ]/g, '');
    } else if (options.type === 'search') {
        sanitized = sanitized.replace(/[\x00-\x1F\x7F<>]/g, '');
    }

    if (options.max_length && sanitized.length > options.max_length) {
        sanitized = sanitized.slice(0, options.max_length);
    }

    return sanitized;
}

function validate_username(value) {
    const sanitized = sanitize_input(value, { type: 'username', max_length: 64 });

    if (sanitized !== value) {
        return { valid: false, message: "Username contains invalid characters.", value: "" };
    }
    if (sanitized.length < 3) {
        return { valid: false, message: "Username must be at least 3 characters long.", value: sanitized };
    }
    if (sanitized.length > 64) {
        return { valid: false, message: "Username cannot be longer than 64 characters.", value: sanitized };
    }
    if (!/^[A-Za-z0-9]/.test(sanitized)) {
        return { valid: false, message: "Username must start with a letter or number.", value: sanitized };
    }

    return { valid: true, message: "Username is valid.", value: sanitized };
}

function validate_password(value, options = { min_length: 8, max_length: 128 }) {
    if (typeof value !== 'string') {
        return { valid: false, message: "Password must be text.", value: "" };
    }

    const raw = value;

    // if (raw.length < options.min_length) {
    //     return { valid: false, message: `Password must be at least ${options.min_length} characters long.`, value: "" };
    // }
    if (raw.length > options.max_length) {
        return { valid: false, message: `Password cannot be longer than ${options.max_length} characters.`, value: "" };
    }

    const has_lower = /[a-z]/.test(raw);
    const has_upper = /[A-Z]/.test(raw);
    const has_digit = /[0-9]/.test(raw);
    const has_symbol = /[^A-Za-z0-9]/.test(raw);

    const score = (has_lower ? 1 : 0) +
                  (has_upper ? 1 : 0) +
                  (has_digit ? 1 : 0) +
                  (has_symbol ? 1 : 0);

    if (score < 2) {
        return { valid: false, message: "Password is too weak. Use a mix of letters, numbers, or symbols.", value: "" };
    }

    return { valid: true, message: "Password is valid.", value: raw };
}

function sanitize_search(value, max_length = 250) {
    return sanitize_input(value, { type: 'search', max_length: max_length });
}

function validate_search(value, min_length = 1, max_length = 250) {
    const sanitized = sanitize_search(value, max_length);

    if (sanitized !== value) {
        return { valid: false, message: "Search contains invalid characters.", value: "" };
    }
    if (sanitized.length < min_length) {
        return { valid: false, message: "Search term is too short.", value: sanitized };
    }

    return { valid: true, message: "Search term is valid.", value: sanitized };
}

function is_safe_text(value, max_length = 1024) {
    const sanitized = sanitize_input(value, { type: 'text', max_length: max_length });

    if (sanitized.length === 0) {
        return { valid: false, message: "Text is empty or invalid.", value: sanitized };
    }

    return { valid: true, message: "Text is valid.", value: sanitized };
}

function validate_id(value) {
    if (!value || typeof value !== "string") {
        return { valid: false, message: "ID must be a non-empty string.", value: "" };
    }

    const sanitized = value.trim();

    // Must be exactly 36 characters
    if (sanitized.length !== 36) {
        return { valid: false, message: "ID must be exactly 36 characters long.", value: "" };
    }

    // UUID regex (hex + hyphens in the right places)
    const uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid_regex.test(sanitized)) {
        return { valid: false, message: "ID format is invalid.", value: "" };
    }

    return { valid: true, message: "ID is valid.", value: sanitized };
}

module.exports = {
    sanitize_input,
    validate_username,
    validate_password,
    sanitize_search,
    validate_search,
    is_safe_text,
    validate_id
};
