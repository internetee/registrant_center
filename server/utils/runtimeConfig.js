const ISO_8601_WITH_OFFSET =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

const invalidValueError = (raw) =>
    new Error(
        `Invalid DISCLOSURE_POLICY_ACTIVE_FROM: "${raw}". ` +
            'Expected an ISO 8601 timestamp with an explicit offset (Z or ±HH:MM), ' +
            'e.g. 2027-01-18T00:00:00+02:00.'
    );

// JS date parsing rolls impossible dates such as 2027-02-30 over into the next
// month instead of rejecting them, so the calendar day must also survive a
// round trip in the value's own offset.
function isRealCalendarDate(value, parsed) {
    const [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    let offsetMinutes = 0;
    if (!value.endsWith('Z')) {
        const offset = value.slice(-6);
        const sign = offset[0] === '+' ? 1 : -1;
        offsetMinutes = sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4, 6)));
    }

    const wallClock = new Date(parsed.getTime() + offsetMinutes * 60 * 1000);
    return (
        wallClock.getUTCFullYear() === Number(year) &&
        wallClock.getUTCMonth() === Number(month) - 1 &&
        wallClock.getUTCDate() === Number(day)
    );
}

export function parseDisclosurePolicyActiveFrom(raw) {
    if (raw === undefined || raw === null || !String(raw).trim()) {
        return null;
    }

    const value = String(raw).trim();

    if (!ISO_8601_WITH_OFFSET.test(value)) {
        throw invalidValueError(raw);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()) || !isRealCalendarDate(value, parsed)) {
        throw invalidValueError(raw);
    }

    return value;
}

export function buildRuntimeConfigScript(config) {
    return `window.__RUNTIME_CONFIG__ = Object.freeze(${JSON.stringify(config)});`;
}

export function runtimeConfigHandler(config) {
    const script = buildRuntimeConfigScript(config);

    return (req, res) => {
        res.set({
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
        });
        res.send(script);
    };
}
