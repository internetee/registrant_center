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
    CSVLink: ({ children, id, data, filename }) => (
        <a id={id} href="#" className="csv-link" data-testid="csv-link">
            {children}
        </a>
    ),
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
        lang: 'et'
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
                <UserData 
                    {...defaultProps}
                    {...props}
                    domains={props.domains || domains} 
                />
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

    it('handles CSV generation when clicking CSV button', async () => {
        const { container, getByTestId } = renderUserData();

        // Get the CSV button and click it
        const csvButton = container.querySelector('button:first-child');
        expect(csvButton).toBeInTheDocument();
        
        // Click the button to trigger CSV generation
        fireEvent.click(csvButton);

        // Wait for and verify CSV link appears
        await waitFor(() => {
            const csvLink = getByTestId('csv-link');
            expect(csvLink).toBeInTheDocument();
        });
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
});
