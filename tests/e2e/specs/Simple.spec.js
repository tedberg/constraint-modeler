describe('Demo - Simple Page Tests', () => {
  it('Creates an Age Greater than 25 constraint"', () => {
    cy.visit('/simple');

    // We should not see projections for this setup
    cy.get('div.projection-group').should('not.exist');

    // Click to add a constraint
    cy.get('[data-test=add-constraint]').click();   // +C button

    cy.get('[data-test=property-menu]').click();
    cy.contains('Age').click();

    cy.get('[data-test=comparison-menu]').click();
    cy.contains('Greater Than').click();

    cy.get('#test_valueEntry-11000')
      .type('25')
      .should('have.value', '25');

    cy.contains('Render Syntax').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '(age Greater Than 25)');
  });
});
