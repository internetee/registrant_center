import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
    let originalScrollTo;

    beforeEach(() => {
        originalScrollTo = window.scrollTo;
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        window.scrollTo = originalScrollTo;
        vi.clearAllMocks();
    });

    it('calls window.scrollTo on mount', () => {
        render(
            <ScrollToTop>
                <div>Test content</div>
            </ScrollToTop>
        );
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('renders children', () => {
        const { container } = render(
            <ScrollToTop>
                <div data-testid="child">Test content</div>
            </ScrollToTop>
        );
        expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
        expect(container.textContent).toBe('Test content');
    });

    it('calls scrollTo only once on mount', () => {
        const { rerender } = render(
            <ScrollToTop>
                <div>Test</div>
            </ScrollToTop>
        );
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
        rerender(
            <ScrollToTop>
                <div>Test 2</div>
            </ScrollToTop>
        );
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
    });
});
