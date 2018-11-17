describe('Demo - Persistent Page Tests', () => {
  it('Loads a predefined constraint definition"', () => {
    cy.visit('/persistent');

    // We should not see projections for this setup
    cy.get('div.projection-group').should('not.exist');

    cy.contains('Render Syntax').click();

    cy.get('div.alerts')
      .find('span.syntaxDisplay')
      .should('contain.text', '(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like \'*Y\'))');
  });
});
