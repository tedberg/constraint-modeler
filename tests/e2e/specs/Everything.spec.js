describe('Demo - Everything Page Tests', () => {
  it('Loads a predefined constraint definition"', () => {
    cy.visit('/everything');

    // We should see projections for this setup
    cy.get('div.projection-group').should('exist');

    cy.contains('Render Syntax').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '(name,age)(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like \'*Y\'))');

    cy.contains('Render Query String').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', 'property=name;age&grouped=false&projectionAsMap=false&constraint[value]=status:eq:ENABLED;age:gt:50&constraint[sub1][junction]=or&constraint[sub1][value]=age:lte:35;upper(name):like:*Y');

    cy.contains('Render JSON').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '{"constraintGroup":{"constraint":{"value":"status:eq:ENABLED;age:gt:50","sub1":{"junction":"or","value":"age:lte:35;upper(name):like:*Y"}}},"projectionGroup":{"property":"name;age","grouped":false,"projectionAsMap":false}}');
  });
});
