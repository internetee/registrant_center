import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { IntlProvider } from 'react-intl';
import DomainGridItem from './index';

vi.mock('../../../utils/domainStatuses.json', () => ({
    default: {
        serverDeleteProhibited: { color: 'pink' },
        serverUpdateProhibited: { color: 'teal' },
    },
}));

const messages = {
    'domain.registrant': 'Registrant',
    'domain.registrant.name': 'Name',
    'domain.registrant.email': 'Email',
    'domain.registrant.phone': 'Phone',
    'domains.domain.validTo': 'Valid to: {valid_to}',
    'domains.domain.outzoneAt': 'Outzone at: {outzone_at}',
    'domains.domain.deleteAt': 'Delete at: {delete_at}',
    'domains.domain.registrantVerificationAskedAt':
        'Verification asked at: {registrant_verification_asked_at}',
    'domain.status.serverDeleteProhibited': 'Server Delete Prohibited',
    'domain.status.serverDeleteProhibited.description': 'Server Delete Prohibited description',
    'domain.status.serverUpdateProhibited': 'Server Update Prohibited',
    'domain.status.serverUpdateProhibited.description': 'Server Update Prohibited description',
};

const Wrapper = ({ children }) => (
    <IntlProvider locale="et" messages={messages}>
        <BrowserRouter>{children}</BrowserRouter>
    </IntlProvider>
);

const mockDomain = {
    id: 'test-id',
    name: 'test.ee',
    registrar: {
        name: 'Test Registrar',
        website: 'https://test.ee',
    },
    statuses: ['serverDeleteProhibited', 'serverUpdateProhibited'],
    registrant: {
        id: 'contact-1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+37212345678',
    },
    valid_to: '2025-12-31T23:59:59Z',
    outzone_at: '2025-12-31T23:59:59Z',
    delete_at: '2026-01-31T23:59:59Z',
    registrant_verification_asked_at: '2025-01-01T00:00:00Z',
};

describe('DomainGridItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders domain name and link', () => {
        render(
            <Wrapper>
                <DomainGridItem domain={mockDomain} lang="et" />
            </Wrapper>
        );
        expect(screen.getByText('test.ee')).toBeInTheDocument();
        const link = screen.getByRole('link', { name: /test\.ee/i });
        expect(link).toHaveAttribute('href', '/domain/test-id');
    });

    it('renders registrar name with website link', () => {
        render(
            <Wrapper>
                <DomainGridItem domain={mockDomain} lang="et" />
            </Wrapper>
        );
        const registrarLink = screen.getByRole('link', { name: /test registrar/i });
        expect(registrarLink).toHaveAttribute('href', 'https://test.ee');
        expect(registrarLink).toHaveAttribute('target', '_blank');
    });

    it('renders registrar as text when website is missing', () => {
        const domainWithoutWebsite = {
            ...mockDomain,
            registrar: { name: 'Test Registrar' },
        };
        render(
            <Wrapper>
                <DomainGridItem domain={domainWithoutWebsite} lang="et" />
            </Wrapper>
        );
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('toggles extra content on button click', () => {
        render(
            <Wrapper>
                <DomainGridItem domain={mockDomain} lang="et" />
            </Wrapper>
        );
        const buttons = screen.getAllByRole('button');
        const toggleButton = buttons.find((btn) => btn.classList.contains('toggle'));
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);
        expect(screen.getByText(/registrant/i)).toBeInTheDocument();
    });

    it('toggles status visibility', () => {
        render(
            <Wrapper>
                <DomainGridItem domain={mockDomain} lang="et" />
            </Wrapper>
        );
        const statusButtons = screen.getAllByRole('button');
        const statusToggleButton = statusButtons.find((btn) => btn.textContent?.includes('+'));
        if (statusToggleButton) {
            fireEvent.click(statusToggleButton);
            expect(screen.getByRole('button', { name: /-1/i })).toBeInTheDocument();
        }
    });

    it('returns null when domain is not provided', () => {
        const { container } = render(
            <Wrapper>
                <DomainGridItem domain={null} lang="et" />
            </Wrapper>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders date fields when present', () => {
        render(
            <Wrapper>
                <DomainGridItem domain={mockDomain} lang="et" />
            </Wrapper>
        );
        expect(screen.getByText(/valid to/i)).toBeInTheDocument();
        expect(screen.getByText(/outzone at/i)).toBeInTheDocument();
        expect(screen.getByText(/delete at/i)).toBeInTheDocument();
        expect(screen.getByText(/verification asked at/i)).toBeInTheDocument();
    });
});
