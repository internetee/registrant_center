// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
import './commands';

beforeEach(() => {
    // Use cy.session() to preserve cookies between tests
    cy.session('user session', () => {
        // Preserve only the 'user' cookie if it exists
        cy.getCookie('user').then((cookie) => {
            if (cookie) {
                cy.setCookie('user', cookie.value);
            }
        });
    });
});

/* eslint-disable no-unused-vars */
// Configure other Cypress behaviors if needed
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
});
