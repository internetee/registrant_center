const { baseUrl } = Cypress.config();

describe('Integration tests', () => {
    beforeEach(() => {
        cy.server();
        cy.route('GET', '**/api/menu/main', 'fx:menuMain').as('getMainMenu');
        cy.route('GET', '**/api/menu/footer', 'fx:menuFooter').as('getFooterMenu');
        cy.route('GET', '**/api/user', 'fx:user').as('getUser');
        cy.route('POST', '**/api/destroy', 'fx:user').as('destroySession');
        cy.route('GET', '**/api/companies?*', 'fx:companies').as('getCompanies');
        cy.route('GET', '**/api/domains?*', 'fx:domains').as('getDomains');
        cy.route('GET', '**/api/domains/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e', 'fx:domain').as(
            'getDomain'
        );
        cy.route(
            'GET',
            '**/api/domains/2198affc-7479-499d-9eae-b0611ec2fb49',
            'fx:domain-locked'
        ).as('getLockedDomain');
        cy.route('POST', '**/api/domains/*/registry_lock', 'fx:domain').as('setDomainLock');
        cy.route('DELETE', '**/api/domains/*/registry_lock', 'fx:domain').as('deleteDomainLock');
        cy.route('GET', '**/api/contacts?*', 'fx:contacts').as('getContacts');
        cy.route(
            'GET',
            '**/api/contacts/cfbfbb76-aed8-497a-91c1-48d82cbc4588?links=true',
            'fx:contact-registrant'
        ).as('getRegistrant');
        cy.route(
            'GET',
            '**/api/contacts/528240a3-3f9e-4d9a-83a2-3b3a43cf0dc7?links=true',
            'fx:contact-admin'
        ).as('getAdmin');
        cy.route(
            'GET',
            '**/api/contacts/700829af-4bdd-4c5f-8389-f6568e2ba4ad?links=true',
            'fx:contact-tech'
        ).as('getTech');
        cy.route('PATCH', '**/api/contacts/*', 'fx:contacts').as('setContacts');
        cy.route('PATCH', '**/api/contacts/*', 'fx:contact-registrant').as('setRegistrantContacts');
    });

    it('Should load login page', () => {
        cy.visit('/login');
        cy.wait('@getMainMenu').its('status').should('eq', 200);
        cy.wait('@getFooterMenu').its('status').should('eq', 200);
    });

    it('Should accept cookies', () => {
        cy.get('.cookie-notice button').click();
        cy.getCookie('cookiesAccepted').should('exist');
    });

    it('Should load dashboard', () => {
        cy.login();
        cy.visit('/');
        cy.wait('@getUser').its('status').should('eq', 200);
        cy.wait('@getDomains').its('status').should('eq', 200);
    });

    it('Should have "user" cookie set', () => {
        cy.getCookie('user').should('exist');
    });

    it('Displays domains grid', () => {
        cy.get('.domains-grid--item h2').as('domains').should('have.length', 2);
        cy.get('@domains').first().should('have.text', 'domain.ee');
        cy.get('@domains').eq(1).should('have.text', 'lockeddomain.ee');
    });

    it('Displays user name', () => {
        cy.get('.main-hero h1').should('contain', 'Test Registrant');
    });

    it('Finds lockeddomain.ee by search', () => {
        cy.get('.search-field input').type('lockeddomain');
        cy.get('.search-field .primary').click();
        cy.get('.domains-grid--item h2').as('domain').should('have.length', 1);
        cy.get('@domain').should('have.text', 'lockeddomain.ee');
    });

    it('Displays "no results found" message', () => {
        cy.get('.search-field input').type('sdgsdgsdsdlfkhsdkjfhsd');
        cy.get('.search-field .primary').click();
        cy.get('.page--message').should('have.length', 1);
    });

    it('Resets search results', () => {
        cy.get('.search-field .orange').click();
        cy.get('.domains-grid--item h2').should('have.length', 2);
    });

    it('Toggles advanced search filters', () => {
        cy.get('.form-filter--actions .filter').click();
        cy.get('.form-filter--adv-search').should('have.class', 'visible');
        cy.get('.form-filter--actions .filter').click();
        cy.get('.form-filter--adv-search').should('not.have.class', 'visible');
    });

    it('Toggles domains list', () => {
        cy.get('.form-filter--actions .action--list').click();
        cy.get('.domains-list').parent().should('have.class', 'visible');
        cy.get('.form-filter--actions .action--list').click();
        cy.get('.domains-list').parent().should('not.have.class', 'visible');
    });

    it('Toggles domains grid', () => {
        cy.get('.form-filter--actions .action--grid').click();
        cy.get('.domains-grid').parent().should('not.have.class', 'visible');
        cy.get('.form-filter--actions .action--grid').click();
        cy.get('.domains-grid').parent().should('have.class', 'visible');
    });

    it('Toggles domain extra info', () => {
        cy.get('.domains-grid--item:first-child .toggle').click();
        cy.get('.domains-grid--item:first-child .slide').should('exist');
        cy.get('.domains-grid--item:first-child .toggle').click();
        cy.get('.domains-grid--item:first-child .slide').should('not.exist');
    });

    it('Links to domain.ee detail view', () => {
        cy.get('.domains-grid--item:first-child .link').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e`);
        cy.wait('@getAdmin').its('status').should('eq', 200);
        cy.wait('@getTech').its('status').should('eq', 200);
        cy.wait('@getRegistrant').its('status').should('eq', 200);
    });

    it('Shows & closes domain lock modal', () => {
        cy.get('[data-test="open-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('be.visible');
        cy.get('[data-test="close-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('not.exist');
    });

    it('Sends API request to set domain lock', () => {
        cy.get('[data-test="open-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').click();
        cy.wait('@setDomainLock').its('status').should('eq', 200);
    });

    it('Sends API request to change WhoIs visibility', () => {
        cy.get('.adv-field-group input[name="name"] + label').click();
        cy.get('.form-actions button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').its('status').should('eq', 200);
    });

    it('Links to domain.ee edit view', () => {
        cy.get('[data-test="link-domain-edit"]').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e/edit`);
    });

    it('Sends API request to change contacts', () => {
        cy.get('input[type="email"]').clear().type('testregistrant@test.ee');
        cy.get('input[name="name"] + label').click();
        cy.get('.form-actions button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').its('status').should('eq', 200);
    });

    it('Links back to domain.ee detail view', () => {
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e`);
    });

    it('Links back to Dashboard', () => {
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Links to lockeddomain.ee detail view', () => {
        cy.get('.domains-grid--item:last-child .link').click();
        cy.url().should('eq', `${baseUrl}/domain/2198affc-7479-499d-9eae-b0611ec2fb49`);
        cy.wait('@getLockedDomain').its('status').should('eq', 200);
        cy.wait('@getAdmin').its('status').should('eq', 200);
        cy.wait('@getTech').its('status').should('eq', 200);
        cy.wait('@getRegistrant').its('status').should('eq', 200);
    });

    it('Shows & closes domain unlock modal', () => {
        cy.get('[data-test="open-unlock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('be.visible');
        cy.get('[data-test="close-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('not.exist');
    });

    it('Sends API request to delete domain lock', () => {
        cy.get('[data-test="open-unlock-modal"]').click();
        cy.get('[data-test="lock-domain"]').click();
        cy.wait('@deleteDomainLock').its('status').should('eq', 200);
    });

    it('Links back to Dashboard from lockeddomain.ee detail view', () => {
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Links to Companies page', () => {
        cy.get('.quicklinks--link[href="/companies"]').click();
        cy.url().should('eq', `${baseUrl}/companies`);
        cy.wait('@getCompanies').its('status').should('eq', 200);
    });

    it('Displays companies list', () => {
        cy.get('.table tbody tr').should('have.length', 2);
    });

    it('Links back to Dashboard from Companies page', () => {
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Links to WhoIs page', () => {
        cy.get('.quicklinks--link[href="/whois"]').click();
        cy.url().should('eq', `${baseUrl}/whois`);
        // cy.wait('@getDomains').its('status').should('eq', 200);
    });

    it('Displays domains list', () => {
        cy.get('.table tbody tr').should('have.length', 4);
    });

    it('Opens domain detail info', () => {
        cy.get('.table tbody tr:first-child button').click();
        cy.get('.table tbody tr:first-child .adv-field-group.u-visible').should('be.visible');
    });

    it('Send API request to change WhoIs visibility', () => {
        cy.get('.table tbody tr:first-child input[name="name"]').should('exist');
        cy.get('.table tbody tr:first-child input[name="email"]').should('exist');
        cy.get('.table tbody tr:first-child .adv-field-group input[name="name"] + label').click();
        cy.get('.form-filter--actions button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').its('status').should('eq', 200);
    });

    it('Links back to Dashboard from WhoIs page', () => {   
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Successfully logs user out', () => {
        cy.get('.log-out').click();
        cy.url().should('eq', `${baseUrl}/login`);
    });
});
