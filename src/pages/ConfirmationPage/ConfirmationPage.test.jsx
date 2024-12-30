import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import ConfirmationPage from './ConfirmationPage';
import Providers from '../../__mocks__/Providers';
import { useParams } from 'react-router-dom';

const mockVerification = {
    domainName: 'test-domain.ee',
    currentRegistrant: {
        name: 'Current Registrant',
        ident: '12345678',
        country: 'EE'
    },
    newRegistrant: {
        name: 'New Registrant',
        ident: '87654321',
        country: 'EE'
    },
    status: null,
};

// Mock the verification actions
vi.mock('../../redux/reducers/verification', () => ({
    fetchVerification: () => ({
        type: 'verification/fetchVerification/fulfilled',
        payload: mockVerification
    }),
    respondToVerification: (domain, token, shouldConfirm, type) => ({
        type: 'verification/respondToVerification/fulfilled',
        payload: {
            domainName: mockVerification.domainName,
            currentRegistrant: mockVerification.currentRegistrant,
            newRegistrant: mockVerification.newRegistrant,
            status: shouldConfirm === 'confirmed' ? 'confirmed' : 'rejected'
        }
    })
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn()
}));

const createTestStore = (overrides = {}) => {
    const baseState = {
        ui: {
            uiElemSize: 'small',
            lang: 'et',
            menus: { main: [] },
            isMainMenuOpen: false
        },
        user: {
            data: {}
        },
        verification: mockVerification
    };

    // Create reducers that actually handle the verification actions
    const reducers = {
        ui: (state = { ...baseState.ui, ...overrides.ui }) => state,
        user: (state = { ...baseState.user, ...overrides.user }) => state,
        verification: (state = { ...baseState.verification, ...overrides.verification }, action) => {
            switch (action.type) {
                case 'verification/respondToVerification/fulfilled':
                    return {
                        ...state,
                        ...action.payload
                    };
                default:
                    return state;
            }
        }
    };

    return configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });
};

describe('ConfirmationPage', () => {
    let store;

    beforeEach(() => {
        vi.mocked(useParams).mockReturnValue({ 
            name: 'test-domain.ee',
            token: 'token',
            type: 'change'
        });
        store = createTestStore();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly for change request', async() => {
        const { container } = render(
            <Providers store={store}>
                <ConfirmationPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });
        
        // Basic structure checks
        expect(container.querySelector('.page--whois')).toBeInTheDocument();
        expect(container.querySelector('.page--header')).toBeInTheDocument();
        
        // Check if verification data is displayed
        expect(container.textContent).toContain(mockVerification.domainName);
        expect(container.textContent).toContain(mockVerification.currentRegistrant.name);
        expect(container.textContent).toContain(mockVerification.newRegistrant.name);
    });

    it('renders error message when no name and type present', () => {
        vi.mocked(useParams).mockReturnValue({ name: null, token: null, type: null });

        const { container } = render(
            <Providers store={store}>
                <ConfirmationPage />
            </Providers>
        );
        
        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(container.textContent).toContain('Kahjuks sellisele URL-le vastavat lehte ei leitud');
    });

    it('renders form without fetching if token is null', () => {
        vi.mocked(useParams).mockReturnValue({ name: 'test-domain.ee', token: null, type: 'change' });
        const initialStore = createTestStore({
            verification: {
                domainName: null,
                currentRegistrant: null,
                newRegistrant: null,
                status: null,
            }
        });

        const { container } = render(
            <Providers store={initialStore}>
                <ConfirmationPage />
            </Providers>
        );
        
        expect(container.querySelector('.page--whois')).toBeInTheDocument();
        expect(container.querySelector('.page--message')).toBeInTheDocument();
        expect(container.textContent).toContain('Domeeni omanikuvahetust pole võimalik kinnitada.');
    });

    it('shows error message when verification is not available', async() => {
        const errorStore = createTestStore({
            verification: {
                domainName: null
            }
        });

        const { container } = render(
            <Providers store={errorStore}>
                <ConfirmationPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(container.querySelector('.frown.outline.icon')).toBeInTheDocument();
        expect(container.textContent).toContain('Domeeni omanikuvahetust pole võimalik kinnitada.');
    });

    it('handles confirmation action correctly', async () => {
        const { container } = render(
            <Providers store={store}>
                <ConfirmationPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(store.getState().verification.status).toBeNull();

        // Find and click confirm button
        const confirmButton = container.querySelector('button[data-test="confirm"].primary');
        fireEvent.click(confirmButton);

        // Wait for and check confirmation result
        await waitFor(() => {
            expect(store.getState().verification.status).toBe('confirmed');
            expect(container.textContent).toContain('Omanikuvahetus on edukalt heaks kiidetud.');
        });
    });

    it('handles rejection action correctly', async () => {
        const { container } = render(
            <Providers store={store}>
                <ConfirmationPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(store.getState().verification.status).toBeNull();

        // Find and click reject button
        const rejectButton = container.querySelector('button[data-test="reject"].secondary');
        fireEvent.click(rejectButton);

        // Wait for and check rejection result
        await waitFor(() => {
            expect(store.getState().verification.status).toBe('rejected');
            expect(container.textContent).toContain('Omanikuvahetuse avaldus on edukalt tagasilükatud.');
        });
    });

    it('shows different content for delete request', async() => {
        vi.mocked(useParams).mockReturnValue({ name: 'test-domain.ee', token: 'token', type: 'delete' });

        const { container } = render(
            <Providers store={store}>
                <ConfirmationPage />
            </Providers>
        );

        await waitFor(() => {
            expect(container.querySelector('.loading')).not.toBeInTheDocument();
        });

        expect(container.textContent).toContain('Oleme saanud taotluse domeeni kustutamise jaoks.');
        expect(container.querySelector('.new_registrant')).not.toBeInTheDocument();
    });
});
