import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import banner from './banner';
import colors from './terminalColors';

describe('utils/banner', () => {
    let spy;
    beforeEach(() => {
        spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        spy.mockRestore();
    });

    it('prints banner with color codes', () => {
        banner();
        expect(spy).toHaveBeenCalled();
        const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
        expect(output).toContain(colors.cyan);
        expect(output).toContain(colors.reset);
    });
});
