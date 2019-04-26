/* global Cypress */
// This is a extreme simple example of a cypress e2e test - it barely scratches the surface
// See the docs at https://docs.cypress.io/guides/overview/why-cypress.html#
// import config from 'config';

// 'port' should match the values set in the production and test config files
// This is because the 'npm run test:e2e' uses a different port so that e2e tests can be run in
// parallel with your dev server etc
const { baseUrl } = Cypress.env();

describe('Integration tests', () => {

  beforeEach(() => {
    cy.server();
    cy.route('GET','**/api/user', 'fx:user').as('getUser');
    cy.route('GET', '**/api/domains?*', 'fx:domains').as('getDomains');
    cy.route('POST', '**/api/domains/*/registry_lock', 'fx:domains').as('setDomainLock');
    cy.route('DELETE', '**/api/domains/*/registry_lock', 'fx:domains').as('deleteDomainLock');
    cy.route('GET', '**/api/contacts?*', 'fx:contacts').as('getContacts');
    cy.route('PATCH', '**/api/contacts/*', 'fx:contacts').as('setContacts');
  });
  
  afterEach(() => {
    cy.wait(5000);
  });
  
  it('Should load login page', () => {
    cy.visit('/login');
    console.log(cy.url()); // eslint-disable-line no-console
    cy.url().should('eq', '/login');
  });
  
  it('Should accept cookies', () => {
    cy.get('.cookie-notice button').click();
    cy.getCookie('cookies_accepted').should('exist');
  });
  
  it('Should load dashboard', () => {
    cy.login();
    cy.visit(`${baseUrl}/`);
    cy.url().should('eq', `${baseUrl}/`);
  });
  
  it('Should have "user" cookie set', () => {
    cy.getCookie('user').should('exist');
  });
  
  describe('When API requests completed',  () => {
    
    it('Displays domains grid', () => {
      cy.getCookie('user').should('exist');
      cy.get('.domains-grid--item h2').as('domains')
        .should('have.length', 2);
      
      cy.get('@domains').first()
        .should('have.text', 'domain.ee');
      
      cy.get('@domains').eq(1)
        .should('have.text', 'lockeddomain.ee');
    });
  
    it('Displays user name', () => {
      cy.get('.main-hero h1').should('contain', 'Test Registrant');
    });
  
    it('Finds lockeddomain.ee by search', () => {
      cy.get('.search-field input').type('lockeddomain');
      cy.get('.search-field .primary').click();
      cy.get('.domains-grid--item h2').as('domain')
        .should('have.length', 1);
      cy.get('@domain').should('have.text', 'lockeddomain.ee');
    });
  
    it('Displays "no results found" message', () => {
      cy.get('.search-field input').type('sdgsdgsdsdlfkhsdkjfhsd');
      cy.get('.search-field .primary').click();
      cy.get('.page--message').should('have.length', 1);
    });
  
    it('Resets search results', () => {
      cy.get('.search-field .orange').click();
      cy.get('.domains-grid--item h2')
        .should('have.length', 2);
    });
  
    it('Toggles advanced search filters', () => {
      cy.get('.form-filter--actions .filter').click();
      cy.get('.form-filter--adv-search').should('have.class', 'visible');
      cy.get('.form-filter--actions .filter').click();
      cy.get('.form-filter--adv-search').should('not.have.class', 'visible');
    });
  
    it('Toggles domains list', () => {
      cy.get('.form-filter--actions .action--list').click();
      cy.get('.domains-list').parent().should('have.class','visible');
      cy.get('.form-filter--actions .action--list').click();
      cy.get('.domains-list').parent().should('not.have.class','visible');
    });
  
    it('Toggles domains grid', () => {
      cy.get('.form-filter--actions .action--grid').click();
      cy.get('.domains-grid').parent().should('not.have.class','visible');
      cy.get('.form-filter--actions .action--grid').click();
      cy.get('.domains-grid').parent().should('have.class','visible');
    });
  
    it('Toggles domain extra info', () => {
      cy.get('.domains-grid--item:first-child .toggle').click();
      cy.get('.domains-grid--item:first-child .extra').should('have.class', 'visible');
      cy.get('.domains-grid--item:first-child .toggle').click();
      cy.get('.domains-grid--item:first-child .extra').should('not.have.class', 'visible');
    });
    
    it('Links to domain.ee detail view', () => {
      cy.get('.domains-grid--item:first-child .link').click();
      cy.url().should('eq', `${baseUrl}/domain/domain.ee`);
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
      cy.wait('@setDomainLock');
    });
  
    it('Sends API request to change WhoIs visibility', () => {
      cy.get('.adv-field-group input[name="name"] + label').click();
      cy.get('.form-actions button').click();
      cy.wait('@setContacts');
    });
  
    it('Links to domain.ee edit view', () => {
      cy.get('[data-test="link-domain-edit"]').click();
      cy.url().should('eq', `${baseUrl}/domain/domain.ee/edit`);
    });
  
    it('Sends API request to change contacts', () => {
      cy.get('input[type="email"]').clear().type('testregistrant@test.ee');
      cy.get('input[name="name"] + label').click();
      cy.get('.form-actions button').click();
      cy.wait('@setContacts');
    });
  
    it('Links back to domain.ee detail view', () => {
      cy.get('.back-link').click();
      cy.url().should('eq', `${baseUrl}/domain/domain.ee`);
    });
  
    it('Links back to Dashboard', () => {
      cy.get('.back-link').click();
      cy.url().should('eq', `${baseUrl}/`);
    });
  
    it('Links to lockeddomain.ee detail view', () => {
      cy.get('.domains-grid--item:last-child .link').click();
      cy.url().should('eq', `${baseUrl}/domain/lockeddomain.ee`);
    });
  
    it('Shows & closes domain unlock modal', () => {
      cy.get('[data-test="open-unlock-modal"]').click();
      cy.get('[data-test="unlock-domain"]').should('be.visible');
      cy.get('[data-test="close-unlock-modal"]').click();
      cy.get('[data-test="unlock-domain"]').should('not.exist');
    });
  
    it('Sends API request to delete domain lock', () => {
      cy.get('[data-test="open-unlock-modal"]').click();
      cy.get('[data-test="unlock-domain"]').click();
      cy.wait('@deleteDomainLock');
    });
  
    it('Links back to Dashboard from lockeddomain.ee detail view', () => {
      cy.get('.back-link').click();
      cy.url().should('eq', `${baseUrl}/`);
    });
  
    it('Links to Companies page', () => {
      cy.get('.quicklinks--link[href="/companies"]').click();
      cy.url().should('eq', `${baseUrl}/companies`);
    });
  
    it('Displays companies list', () => {
      cy.get('.table tbody tr').should('have.length', 3);
    });
  
    it('Links back to Dashboard from Companies page', () => {
      cy.get('.back-link').click();
      cy.url().should('eq', `${baseUrl}/`);
    });
  
    it('Links to WhoIs page', () => {
      cy.get('.quicklinks--link[href="/whois"]').click();
      cy.url().should('eq', `${baseUrl}/whois`);
    });
  
    it('Displays domains list', () => {
      cy.get('.table tbody tr').should('have.length', 2);
    });
  
    it('Opens domain detail info', () => {
      cy.get('.table tbody tr:first-child a[role="button"]').click();
      cy.get('.table tbody tr:first-child .adv-field-group').should('be', 'visible');
    });
  
    it('Send API request to change WhoIs visibility', () => {
      cy.get('.table tbody tr:first-child div[data-contacts] label').click();
      cy.get('.form-filter--actions button').click();
      cy.wait('@setContacts');
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
});