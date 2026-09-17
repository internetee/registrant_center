import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import moment from 'moment';
import DomainAccessEvents from './DomainAccessEvents';
import Providers from '../../__mocks__/Providers';

const FORMAT = 'DD.MM.Y HH:mm';

const createTestStore = () =>
    configureStore({
        reducer: {
            ui: (
                state = { uiElemSize: 'small', lang: 'et', menus: { main: [] }, isMainMenuOpen: false }
            ) => state,
        },
    });

const EMPTY_MESSAGE = 'Ükski asutus ei ole selle domeeni andmeid vaadanud.';
const ERROR_MESSAGE = 'Vaatamiste ajalugu ei õnnestunud laadida. Palun proovi uuesti.';

const events = [
    {
        accessed_at: '2026-07-10T12:00:00+03:00',
        organization: 'Politsei- ja Piirivalveamet',
        category: 'police',
    },
    {
        accessed_at: '2026-07-09T09:30:00+03:00',
        organization: null,
        category: 'cert',
    },
];

describe('DomainAccessEvents', () => {
    let store;
    let onRetry;

    const renderPanel = (props = {}) =>
        render(
            <Providers store={store}>
                <DomainAccessEvents onRetry={onRetry} uiElemSize="small" {...props} />
            </Providers>
        );

    beforeEach(() => {
        store = createTestStore();
        onRetry = vi.fn();
    });

    it('renders translated categories, an institution fallback and portal-formatted timestamps', () => {
        const { container } = renderPanel({ events });

        expect(container.textContent).toContain('Kes on minu andmeid vaadanud');

        const rows = Array.from(container.querySelectorAll('[data-test="access-events-row"]')).map(
            (row) => Array.from(row.querySelectorAll('td')).map((td) => td.textContent.trim())
        );

        // The timestamp is rendered in the viewer's own timezone (moment's default), so the
        // expectation is derived the same way rather than hardcoded — what is asserted is the
        // DD.MM.Y HH:mm shape the rest of the portal uses, not a fixed offset.
        expect(rows).toEqual([
            ['Politsei- ja Piirivalveamet', 'Politsei', moment(events[0].accessed_at).format(FORMAT)],
            ['Määramata', 'CERT', moment(events[1].accessed_at).format(FORMAT)],
        ]);
        rows.forEach(([, , accessedAt]) => {
            expect(accessedAt).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
        });

        // the raw category enum must never reach the user
        expect(container.textContent).not.toContain('police');
        expect(container.textContent).not.toContain(events[0].accessed_at);
    });

    it('renders an unrecognised category as its raw value instead of dropping the row', () => {
        const { container } = renderPanel({
            events: [{ ...events[0], category: 'some_new_category' }],
        });

        expect(container.querySelectorAll('[data-test="access-events-row"]')).toHaveLength(1);
        expect(container.textContent).toContain('some_new_category');
    });

    it('renders only the three disclosed fields', () => {
        const { container } = renderPanel({ events });

        ['accessor_name', 'grant_ref', 'request_id', 'caller_ip', 'result_code'].forEach((field) => {
            expect(container.textContent).not.toContain(field);
        });
    });

    it('uses a semantic header with descriptive columns (a11y)', () => {
        const { container } = renderPanel({ events });

        const headerCells = Array.from(container.querySelectorAll('thead th')).map((th) =>
            th.textContent.trim()
        );
        expect(headerCells).toEqual(['Asutus', 'Kategooria', 'Vaatamise aeg']);
    });

    it('shows the empty state only on a successful empty response', () => {
        const { container } = renderPanel({ events: [] });

        expect(container.textContent).toContain(EMPTY_MESSAGE);
        expect(container.querySelector('table')).not.toBeInTheDocument();
    });

    it('shows a loader — never the empty state — while the fetch is in flight', () => {
        const { container } = renderPanel({ isLoading: true });

        expect(container.querySelector('[data-test="access-events-loading"]')).toBeInTheDocument();
        expect(container.textContent).not.toContain(EMPTY_MESSAGE);
    });

    it('shows an error with a working retry — never the empty state — on failure', () => {
        const { container } = renderPanel({ error: true });

        expect(container.querySelector('[data-test="access-events-error"]')).toBeInTheDocument();
        expect(container.textContent).toContain(ERROR_MESSAGE);
        expect(container.textContent).not.toContain(EMPTY_MESSAGE);

        fireEvent.click(container.querySelector('[data-test="access-events-retry"]'));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('keeps the empty state away when a refresh fails over a previously empty result', () => {
        // The reducer keeps the last successful payload on FAILURE, so an empty array can coexist
        // with error: true. That combination must read as "could not load", not as "nobody looked".
        const { container } = renderPanel({ error: true, events: [] });

        expect(container.textContent).toContain(ERROR_MESSAGE);
        expect(container.textContent).not.toContain(EMPTY_MESSAGE);
    });

    it('renders nothing but the header before any fetch has happened', () => {
        const { container } = renderPanel();

        expect(container.textContent).toContain('Kes on minu andmeid vaadanud');
        expect(container.textContent).not.toContain(EMPTY_MESSAGE);
        expect(container.textContent).not.toContain(ERROR_MESSAGE);
        expect(container.querySelector('table')).not.toBeInTheDocument();
    });
});
