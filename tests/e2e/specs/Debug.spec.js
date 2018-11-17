describe('Demo - Debug Page Tests', () => {
  it('Creates an Age Greater than 25 constraint"', () => {
    cy.visit('/debug');

    // We should not see projections for this setup
    cy.get('div.projection-group').should('not.exist');

    // Click to add a constraint (Not robust selector method)
    cy.contains('+ C').click();

    cy.get('#test_constraint-bar-11000');

    cy.get('#test_property-menu-11000').click();
    cy.contains('Age').click();

    cy.get('#test_comparison-menu-11000').click();
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
