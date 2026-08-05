import { describe, it, expect } from 'vitest';
import colors from './terminalColors';

describe('utils/terminalColors', () => {
    it('exposes expected ANSI codes', () => {
        expect(colors).toHaveProperty('cyan');
        expect(colors).toHaveProperty('reset');
        // eslint-disable-next-line no-control-regex
        expect(colors.cyan).toMatch(/\x1b\[36m/);
        // eslint-disable-next-line no-control-regex
        expect(colors.reset).toMatch(/\x1b\[0m/);
    });
});
