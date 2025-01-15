const { baseUrl } = Cypress.config();

describe('Integration tests', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/menu/main', { fixture: 'menuMain' }).as('getMainMenu');
        cy.intercept('GET', '**/api/menu/footer', { fixture: 'menuFooter' }).as('getFooterMenu');
        cy.intercept('GET', '**/api/user', { fixture: 'user' }).as('getUser');
        cy.intercept('POST', '**/api/destroy', { fixture: 'user' }).as('destroySession');
        cy.intercept('GET', '**/api/companies?*', { fixture: 'companies' }).as('getCompanies');
        cy.intercept('GET', '**/api/domains?*', { fixture: 'domains' }).as('getDomains');
        cy.intercept('GET', '**/api/domains/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e', {
            fixture: 'domain',
        }).as('getDomain');
        cy.intercept('GET', '**/api/domains/2198affc-7479-499d-9eae-b0611ec2fb49', {
            fixture: 'domain-locked',
        }).as('getLockedDomain');
        cy.intercept('POST', '**/api/domains/*/registry_lock?extensionsProhibited=false', {
            fixture: 'domain',
        }).as('setDomainLock');
        cy.intercept('DELETE', '**/api/domains/*/registry_lock', {
            fixture: 'domain',
        }).as('deleteDomainLock');
        cy.intercept('GET', '**/api/contacts?*', { fixture: 'contacts' }).as('getContacts');
        cy.intercept('GET', '**/api/contacts/cfbfbb76-aed8-497a-91c1-48d82cbc4588?links=true', {
            fixture: 'contact-registrant',
        }).as('getRegistrant');
        cy.intercept('GET', '**/api/contacts/528240a3-3f9e-4d9a-83a2-3b3a43cf0dc7?links=true', {
            fixture: 'contact-admin',
        }).as('getAdmin');
        cy.intercept('GET', '**/api/contacts/700829af-4bdd-4c5f-8389-f6568e2ba4ad?links=true', {
            fixture: 'contact-tech',
        }).as('getTech');
        cy.intercept('PATCH', '**/api/contacts/*', { fixture: 'contacts' }).as('setContacts');
        cy.intercept('PATCH', '**/api/contacts/*', {
            fixture: 'contact-registrant',
        }).as('setRegistrantContacts');
        cy.intercept('GET', '**/api/contacts/undefined/do_need_update_contacts', {
            fixture: 'do_need_update',
        }).as('doNeedUpdateContacts');
    });

    it('Should load successfully with menus', () => {
        cy.visit('/login');
        // Wait for and verify menu requests
        cy.wait('@getMainMenu').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.exist;
        });

        cy.wait('@getFooterMenu').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.exist;
        });
    });

    it('Should have user cookie set after login', () => {
        cy.login();
        // Verify cookie exists
        cy.getCookie('user').should('exist');
    });

    it('Should load dashboard', () => {
        cy.login();
        cy.visit('/');
        cy.wait('@getUser').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getDomains').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.wait('@doNeedUpdateContacts').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Displays domains grid', () => {
        cy.visit('/');
        cy.get('.domains-grid--item h2').as('domains').should('have.length', 2);
        cy.get('@domains').first().should('have.text', 'domain.ee');
        cy.get('@domains').eq(1).should('have.text', 'lockeddomain.ee');
    });

    it('Displays user name', () => {
        cy.visit('/');
        cy.get('.main-hero h1').should('contain', 'Test Registrant');
    });

    it('Finds lockeddomain.ee by search', () => {
        cy.visit('/');
        cy.get('.search-field input').type('lockeddomain');
        cy.get('.search-field .primary').click();
        cy.get('.domains-grid--item h2').as('domain').should('have.length', 1);
        cy.get('@domain').should('have.text', 'lockeddomain.ee');
    });

    it('Displays "no results found" message', () => {
        cy.visit('/');
        cy.get('.search-field input').type('sdgsdgsdsdlfkhsdkjfhsd');
        cy.get('.search-field .primary').click();
        cy.get('.page--message').should('have.length', 1);
    });

    it('Resets search results', () => {
        cy.visit('/');
        cy.get('.search-field .orange').click();
        cy.get('.domains-grid--item h2').should('have.length', 2);
    });

    it('Toggles advanced search filters', () => {
        cy.visit('/');
        cy.get('.form-filter--actions .filter').click();
        cy.get('.form-filter--adv-search').should('have.class', 'visible');
        cy.get('.form-filter--actions .filter').click();
        cy.get('.form-filter--adv-search').should('not.have.class', 'visible');
    });

    it('Toggles domains list', () => {
        cy.visit('/');
        cy.get('.form-filter--actions .action--list').click();
        cy.get('.domains-list').parent().should('have.class', 'visible');
        cy.get('.form-filter--actions .action--list').click();
        cy.get('.domains-list').parent().should('not.have.class', 'visible');
    });

    it('Toggles domains grid', () => {
        cy.visit('/');
        cy.get('.form-filter--actions .action--grid').click();
        cy.get('.domains-grid').parent().should('not.have.class', 'visible');
        cy.get('.form-filter--actions .action--grid').click();
        cy.get('.domains-grid').parent().should('have.class', 'visible');
    });

    it('Toggles domain extra info', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .toggle').click();
        cy.get('.domains-grid--item:first-child .slide').should('exist');
        cy.get('.domains-grid--item:first-child .toggle').click();
        cy.get('.domains-grid--item:first-child .slide').should('not.exist');
    });

    it('Links to domain.ee detail view', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e`);
        cy.wait('@getRegistrant').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getTech').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getAdmin').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Shows & closes domain lock modal', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('[data-test="open-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('be.visible');
        cy.get('[data-test="close-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').should('not.exist');
    });

    it('Sends API request to set domain lock', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('[data-test="open-lock-modal"]').click();
        cy.get('[data-test="lock-domain"]').click();
        cy.wait('@setDomainLock').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Sends API request to change WhoIs visibility', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('.adv-field-group input[name="name"] + label').click();
        cy.get('.form-actions button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Links to domain.ee edit view', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('[data-test="link-domain-edit"]').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e/edit`);
    });

    it('Sends API request to change contacts', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('[data-test="link-domain-edit"]').click();
        cy.get('input[type="email"]').clear().type('testregistrant@test.ee');
        cy.get('input[name="name"] + label').click();
        cy.get('.form-actions button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Links back to domain.ee detail view', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('[data-test="link-domain-edit"]').click();
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/domain/bd695cc9-1da8-4c39-b7ac-9a2055e0a93e`);
    });

    it('Links back to Dashboard', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:first-child .link').click();
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Links to lockeddomain.ee detail view', () => {
        cy.visit('/');
        cy.get('.domains-grid--item:last-child .link').click();
        cy.url().should('eq', `${baseUrl}/domain/2198affc-7479-499d-9eae-b0611ec2fb49`);
        cy.wait('@getLockedDomain').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getAdmin').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getTech').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getRegistrant').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Links to Companies page', () => {
        cy.visit('/');
        cy.get('.quicklinks--link[href="/companies"]').click();
        cy.url().should('eq', `${baseUrl}/companies`);
        cy.wait('@getCompanies').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('.table tbody tr').should('have.length', 2);
        cy.get('.back-link').click();
        cy.url().should('eq', `${baseUrl}/`);
    });

    it('Links to WhoIs page and sends API request to change WhoIs visibility', () => {
        cy.visit('/whois');

        cy.wait('@getDomains').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.wait('@getContacts').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.wait('@getCompanies').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
        cy.get('.ui.table tbody tr').should('have.length', 2);
        cy.get('.ui.table tbody tr:first-child').find('button').click();
        cy.get('.ui.table tbody tr:first-child')
            .find('.adv-field-group')
            .should('have.class', 'u-visible');
        cy.get('.ui.table tbody tr:first-child').find('input[name="name"] + label').click();

        cy.get('.ui.table tfoot button').click();
        cy.get('[data-test="change-contacts"]').click();
        cy.wait('@setRegistrantContacts').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('Successfully logs user out', () => {
        cy.visit('/');
        cy.get('.log-out').click();
        cy.url().should('eq', `${baseUrl}/login`);
    });
});
