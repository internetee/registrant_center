export function isDisclosurePolicyActive(now = new Date()) {
    const raw =
        typeof window === 'undefined'
            ? undefined
            : window.__RUNTIME_CONFIG__?.disclosurePolicyActiveFrom;

    if (!raw || !raw.trim()) {
        return false;
    }

    const activeFrom = new Date(raw);

    if (Number.isNaN(activeFrom.getTime())) {
        console.error(
            `Invalid DISCLOSURE_POLICY_ACTIVE_FROM: "${raw}". Falling back to legacy disclosure behaviour.`
        );
        return false;
    }

    return now >= activeFrom;
}
