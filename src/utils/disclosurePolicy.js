export function isDisclosurePolicyActive(now = new Date()) {
    const raw = import.meta.env.VITE_DISCLOSURE_POLICY_ACTIVE_FROM;

    if (!raw || !raw.trim()) {
        return false;
    }

    const activeFrom = new Date(raw);

    if (Number.isNaN(activeFrom.getTime())) {
        console.error(
            `Invalid VITE_DISCLOSURE_POLICY_ACTIVE_FROM: "${raw}". Falling back to legacy disclosure behaviour.`
        );
        return false;
    }

    return now >= activeFrom;
}
