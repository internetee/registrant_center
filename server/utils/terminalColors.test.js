import { describe, it, expect } from 'vitest';
import colors from './terminalColors';

describe('utils/terminalColors', () => {
    it('exposes expected ANSI codes', () => {
        expect(colors).toHaveProperty('cyan');
        expect(colors).toHaveProperty('reset');
        expect(colors.cyan).toMatch(/\x1b\[36m/);
        expect(colors.reset).toMatch(/\x1b\[0m/);
    });
});




