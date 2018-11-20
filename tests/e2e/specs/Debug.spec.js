describe('Demo - Debug Page Tests', () => {
  it('Creates an Age Greater than 25 constraint"', () => {
    cy.visit('/debug');

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

    cy.contains('Render Query String').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', 'constraint[value]=age:gt:25');

    cy.contains('Render JSON').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '{"constraintGroup":{"constraint":{"value":"age:gt:25"}}}');
  });
});
