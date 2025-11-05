import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import UserData from './UserData';
import domains from '../../__mocks__/domains';
import Providers from '../../__mocks__/Providers';

// Mock pdfmake
vi.mock('pdfmake/build/pdfmake', () => ({
    default: {
        createPdf: vi.fn(() => ({
            download: vi.fn(),
        })),
        vfs: {},
        fonts: {},
    },
}));

// Mock react-csv
vi.mock('react-csv', () => ({
    CSVDownload: vi.fn(),
    CSVLink: vi.fn(),
}));

const createStore = (initialState = {}) =>
    configureStore({
        reducer: {
            domains: (
                state = initialState.domains || {
                    domains: [...domains],
                    data: {
                        domains: [...domains],
                    },
                    ids: [],
                }
            ) => state,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });

describe('UserData Component', () => {
    let store;
    const defaultProps = {
        isTech: 'init',
        lang: 'et',
    };

    beforeEach(() => {
        store = createStore({
            domains: {
                domains: [...domains],
                data: {
                    domains: [...domains],
                },
                ids: [],
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderUserData = (props = {}) => {
        return render(
            <Providers store={store}>
                <UserData {...defaultProps} {...props} domains={props.domains || domains} />
            </Providers>
        );
    };

    it('renders without crashing', () => {
        const { container } = renderUserData();
        const element = container.querySelector('.user-data');
        expect(element).toBeInTheDocument();
    });

    it('displays correct title', () => {
        const { getByText } = renderUserData();
        expect(getByText('Minu andmete allalaadimine')).toBeInTheDocument();
    });

    it('shows CSV and PDF buttons', () => {
        const { container } = renderUserData();

        const csvButton = container.querySelector('button:first-child');
        const pdfButton = container.querySelector('button:last-child');

        expect(csvButton).toBeInTheDocument();
        expect(pdfButton).toBeInTheDocument();
    });

    it('handles PDF generation when clicking PDF button', async () => {
        const { container } = renderUserData();

        const pdfButton = container.querySelector('button:last-child');
        fireEvent.click(pdfButton);

        await waitFor(() => {
            expect(pdfButton).not.toHaveAttribute('loading');
        });
    });

    it('disables buttons when no domains are present', () => {
        const emptyStore = createStore({
            domains: {
                domains: [],
                data: {
                    domains: [],
                },
                ids: [],
            },
        });

        const { container } = render(
            <Providers store={emptyStore}>
                <UserData {...defaultProps} domains={[]} />
            </Providers>
        );

        const csvButton = container.querySelector('button:first-child');
        const pdfButton = container.querySelector('button:last-child');

        expect(csvButton).toHaveAttribute('disabled');
        expect(pdfButton).toHaveAttribute('disabled');
    });

    it('handles CSV generation when clicking CSV button', async () => {
        const { container } = renderUserData();

        const csvButton = container.querySelector('button:first-child');
        fireEvent.click(csvButton);

        await waitFor(() => {
            expect(csvButton).not.toHaveAttribute('loading');
        });
    });

    it('handles domains with minimal data', () => {
        const minimalDomains = [
            {
                name: 'test.ee',
                registrar: { name: 'Test Registrar', website: 'test.ee' },
            },
        ];

        const { container } = renderUserData({ domains: minimalDomains });
        const element = container.querySelector('.user-data');
        expect(element).toBeInTheDocument();
    });

    it('handles domains with all fields populated', () => {
        const fullDomains = [
            {
                name: 'test.ee',
                transfer_code: 'ABC123',
                registrar: { name: 'Test Registrar', website: 'test.ee' },
                registered_at: '2023-01-01T00:00:00Z',
                valid_to: '2024-01-01T00:00:00Z',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
                period: 1,
                period_unit: 'year',
                outzone_at: '2024-01-01T00:00:00Z',
                delete_at: '2024-02-01T00:00:00Z',
                registrant_verification_asked_at: '2023-01-01T00:00:00Z',
                registrant_verification_token: 'token123',
                force_delete_at: '2024-03-01T00:00:00Z',
                locked_by_registrant_at: '2023-01-01T00:00:00Z',
                reserved: false,
                registrant: { name: 'Test Registrant' },
                tech_contacts: [{ name: 'Tech', email: 'tech@test.ee' }],
                admin_contacts: [{ name: 'Admin', email: 'admin@test.ee' }],
                nameservers: [
                    { hostname: 'ns1.test.ee', ipv4: ['1.1.1.1'], ipv6: ['::1'] },
                ],
                statuses: ['ok'],
            },
        ];

        const { container } = renderUserData({ domains: fullDomains });
        const element = container.querySelector('.user-data');
        expect(element).toBeInTheDocument();
    });

    it('handles isTech prop correctly', () => {
        const { container } = renderUserData({ isTech: 'true' });
        const element = container.querySelector('.user-data');
        expect(element).toBeInTheDocument();
    });

    it('renders with different language', () => {
        const { container } = renderUserData({ lang: 'en' });
        const element = container.querySelector('.user-data');
        expect(element).toBeInTheDocument();
    });
});
