// Masking configurations
const MASK_CONFIGS = {
    // Mask all except last 4 characters
    MASK_EXCEPT_LAST_4: {
        pattern: /^(.*)(.{4})$/,
        replacement: (match, p1, p2) => '*'.repeat(p1.length) + p2,
    },
    // Mask all except first and last character
    MASK_EXCEPT_ENDS: {
        pattern: /^(.)(.*)(.{1})$/,
        replacement: (match, first, middle, last) => first + '*'.repeat(middle.length) + last,
    },
    // Mask email - show first 2 chars of local part and first char of domain
    MASK_EMAIL: {
        pattern: /^([^@]{1,2})([^@]*)@([^.]{1})(.*)$/,
        replacement: (match, start, rest, domainStart, domainRest) =>
            start + '*'.repeat(rest.length) + '@' + domainStart + '*'.repeat(domainRest.length),
    },
    // Mask everything
    MASK_ALL: {
        pattern: /.+/,
        replacement: () => '***',
    },
};

// Define masking rules for different field types
const MASKING_RULES = {
    password: MASK_CONFIGS.MASK_ALL,
    token: MASK_CONFIGS.MASK_ALL,
    access_token: MASK_CONFIGS.MASK_ALL,
    refresh_token: MASK_CONFIGS.MASK_ALL,
    secret: MASK_CONFIGS.MASK_ALL,
    Authorization: MASK_CONFIGS.MASK_ALL,
    sessionId: MASK_CONFIGS.MASK_EXCEPT_LAST_4,
    credit_card: MASK_CONFIGS.MASK_EXCEPT_LAST_4,
    personalCode: MASK_CONFIGS.MASK_EXCEPT_LAST_4,
    ident: MASK_CONFIGS.MASK_EXCEPT_LAST_4,
    email: MASK_CONFIGS.MASK_EMAIL,
    phone: MASK_CONFIGS.MASK_EXCEPT_LAST_4,
};

function maskValue(value, fieldName) {
    if (!value || typeof value !== 'string') return value;

    const rule = MASKING_RULES[fieldName];
    if (!rule) return value;

    return value.replace(rule.pattern, rule.replacement);
}

export function sanitizeData(data, path = '') {
    if (!data) return data;

    if (typeof data === 'string') {
        const fieldName = path.split('.').pop()?.toLowerCase();
        return maskValue(data, fieldName);
    }

    if (Array.isArray(data)) {
        return data.map((item, index) => sanitizeData(item, `${path}[${index}]`));
    }

    if (typeof data === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            const newPath = path ? `${path}.${key}` : key;
            sanitized[key] = sanitizeData(value, newPath);
        }
        return sanitized;
    }

    return data;
}

// Export the configurations if needed elsewhere
export const maskingRules = MASKING_RULES;
export const maskConfigs = MASK_CONFIGS;
