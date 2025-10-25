describe('Button Proportions on Mobile', () => {
  beforeEach(() => {
    cy.viewport(400, 744);
    cy.visit('/edit?session_id=550e8400-e29b-41d4-a716-446655440000');
    cy.wait(1000);
  });

  it('should maintain correct button proportions [10Add][10Delete]10[7Up][7Down][7Copy]10[Save]', () => {
    // Get all buttons by aria-label
    cy.get('button[aria-label="Add new row"]').as('addBtn');
    cy.get('button[aria-label="Delete selected rows"]').as('deleteBtn');
    cy.get('button[aria-label="Move selected rows up"]').as('upBtn');
    cy.get('button[aria-label="Move selected rows down"]').as('downBtn');
    cy.get('button[aria-label="Copy selected rows"]').as('copyBtn');
    cy.get('button[aria-label="Save changes and send data back to bot"]').as('saveBtn');

    // Get widths
    let widths: { [key: string]: number } = {};

    cy.get('@addBtn').invoke('outerWidth').then((w) => { widths.add = w as number; });
    cy.get('@deleteBtn').invoke('outerWidth').then((w) => { widths.delete = w as number; });
    cy.get('@upBtn').invoke('outerWidth').then((w) => { widths.up = w as number; });
    cy.get('@downBtn').invoke('outerWidth').then((w) => { widths.down = w as number; });
    cy.get('@copyBtn').invoke('outerWidth').then((w) => { widths.copy = w as number; });
    cy.get('@saveBtn').invoke('outerWidth').then((w) => {
      widths.save = w as number;

      cy.log('Button widths:', JSON.stringify(widths));

      // Calculate ratios relative to Add button
      const ratios = {
        add: widths.add / widths.add,
        delete: widths.delete / widths.add,
        up: widths.up / widths.add,
        down: widths.down / widths.add,
        copy: widths.copy / widths.add,
        save: widths.save / widths.add
      };

      cy.log('Button ratios (relative to Add):', JSON.stringify(ratios));

      // Expected ratios: Add=1.0, Delete=1.0, Up=0.7, Down=0.7, Copy=0.7, Save=1.0
      const tolerance = 0.20; // 20% tolerance (accounting for text rendering differences)

      // Add button is the reference (1.0)
      expect(ratios.add).to.equal(1.0);

      // Delete button should be same as Add (1.0)
      expect(ratios.delete).to.be.closeTo(1.0, tolerance);

      // Up button should be 0.7 of Add
      expect(ratios.up).to.be.closeTo(0.7, tolerance);

      // Down button should be 0.7 of Add
      expect(ratios.down).to.be.closeTo(0.7, tolerance);

      // Copy button should be 0.7 of Add
      expect(ratios.copy).to.be.closeTo(0.7, tolerance);

      // Save button should be same as Add (1.0)
      expect(ratios.save).to.be.closeTo(1.0, tolerance);
    });
  });

  it('should have correct spacing between accordion elements', () => {
    // Add a row first
    cy.get('button[aria-label="Add new row"]').click();
    cy.wait(500);

    // Get the first accordion item
    cy.get('.md\\:hidden .flex.items-start.w-full').first().within(() => {
      // Get positions of elements
      cy.get('span').first().as('itemId'); // Row number
      cy.get('input[type="checkbox"]').as('checkbox');
      cy.get('span').eq(1).as('qty'); // Qty

      // Check spacing between elements
      cy.get('@itemId').then(($itemId) => {
        const itemIdRight = $itemId[0].getBoundingClientRect().right;

        cy.get('@checkbox').then(($checkbox) => {
          const checkboxLeft = $checkbox[0].getBoundingClientRect().left;
          const checkboxRight = $checkbox[0].getBoundingClientRect().right;

          // Space between itemId and checkbox should be ~2px (with some tolerance)
          const space1 = checkboxLeft - itemIdRight;
          expect(space1).to.be.closeTo(2, 3);

          cy.get('@qty').then(($qty) => {
            const qtyLeft = $qty[0].getBoundingClientRect().left;

            // Space between checkbox and qty should be ~2px (accounting for negative margins)
            const space2 = qtyLeft - checkboxRight;
            expect(space2).to.be.closeTo(-2, 3); // Negative due to marginRight: '-2px' and marginLeft: '-2px'
          });
        });
      });
    });
  });

  it('should display button symbols at correct size', () => {
    // Check that button symbols are 1.3em
    cy.get('button[aria-label="Add new row"]').should('have.css', 'font-size').then((fontSize) => {
      const size = parseFloat(fontSize as unknown as string);
      // Font size should be approximately 1.3 times the base size
      expect(size).to.be.greaterThan(16); // Assuming base is ~14px, 1.3x would be ~18px
    });
  });
});
