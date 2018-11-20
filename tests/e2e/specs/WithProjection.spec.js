describe('Demo - Projection Page Tests', () => {
  it('Creates an Age Greater than 25 constraint"', () => {
    cy.visit('/projection');

    // We should see projections for this setup
    cy.get('div.projection-group').should('exist');

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

    // Click to add a projection (Not robust selector method)
    cy.contains('+ P').click();

    cy.get('#test_projection-bar-1100');

    cy.get('#test_property-menu-1100').click();
    cy.get('#test_property-menu-1100').contains('Name').click();

    // Click to add a projection (Not robust selector method)
    cy.contains('+ P').click();

    cy.get('#test_projection-bar-1200');

    cy.get('#test_property-menu-1200').click();
    cy.get('#test_property-menu-1200').contains('Age').click();

    cy.contains('Render Syntax').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '(name,age)(age Greater Than 25)');

  });
});
