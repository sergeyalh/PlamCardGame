<template>
  <div id="phaser-game"></div>
</template>

<script>
import Phaser from 'phaser';

// Define the Phaser scene
const gameScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function GameScene() {
    Phaser.Scene.call(this, { key: 'gameScene' });
    this.gameInfo = {
      activePlayerIndex: 0,
      monthsList: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
      colors: [0xFF0000, 0x008000, 0xFF6FFF, 0x0000FF],
      date: { year: 10, month: 1, week: 1 },
      map: []
    };
  },

  preload: function () {
    // Load images
    for (let i = 1; i <= 6; i++) {
      this.load.image('mapPiece' + i, '/map' + i + '.png');
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image('player' + i, '/player' + i + '.png');
    }
    for (let i = 1; i <= 3; i++) {
      this.load.image('char' + i, '/char' + i + '.png');
    }

    this.load.image('turnIndicator', '/clock.png');
  },
  create: function () {
    // Create a menu panel
    const menuWidth = 250;
    const menuHeight = this.game.config.height;
    this.add.rectangle(menuWidth / 2, menuHeight / 2, menuWidth, menuHeight, 0x333333);

    // Add some menu items
    this.date = this.add.text(20, 50, this.gameInfo.date.year + 'K.' +
      this.gameInfo.monthsList[this.gameInfo.date.month - 1] +
      '.' + this.gameInfo.date.week, { font: '16px Arial', fill: '#ffffff' });
    this.add.text(20, 100, this.gameInfo.monthsList[0], { font: '16px Arial', fill: '#ffffff' });

    // Add End Turn Button
    const endTurnButton = this.add.text(85, 580, 'End Turn', { font: '20px Arial', fill: '#ff0000' }).setInteractive();
    endTurnButton.on('pointerdown', () => this.endTurn());

    const characterSlotHeight = 120;
    const characterSlotWidth = menuWidth;
    const panelHeight = 20; // Height for the bottom panel
    const imageHeight = characterSlotHeight - panelHeight; // Remaining height for the image
    const startY = this.game.config.height - (characterSlotHeight * 3); // Position for the first character slot

    // Draw the character slots with images and interactive elements
    for (let i = 0; i < 3; i++) {
      const slotY = startY + (i * characterSlotHeight);

      // Create the character slot
      this.add.rectangle(menuWidth / 2, slotY + (imageHeight / 2), characterSlotWidth, imageHeight, 0x444444);
      // Add character image
      this.add.image(menuWidth / 2, slotY + (imageHeight / 2), 'char' + (i + 1)).setDisplaySize(characterSlotWidth - 3, imageHeight);

      // Create the panel at the bottom of the slot
      const panelY = slotY + imageHeight + (panelHeight / 2);
      this.add.rectangle(menuWidth / 2, panelY, characterSlotWidth, panelHeight, 0x666666);

      // Cost Display in the panel
      this.add.text(20, panelY - 10, 'Cost: [3]', { font: '16px Arial', fill: '#ffffff' });

      // '+' Button in the panel
      const plusButton = this.add.text(menuWidth - 40, panelY - 10, '+', { font: '20px Arial', fill: '#00ff00' }).setInteractive();
      plusButton.on('pointerdown', () => this.addCharacter(i));

      // 'x' Button in the panel
      const deleteButton = this.add.text(menuWidth - 20, panelY - 12, 'x', { font: '20px Arial', fill: '#ff0000' }).setInteractive();
      deleteButton.on('pointerdown', () => this.deleteCharacter(i));

      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        this.add.line(0, 0, 0, slotY, menuWidth, slotY, 0xffffff).setOrigin(0, 0);
      }
    }

    // Draw the player slots
    const playerSlotHeight = 70; // Height of the players section
    const playerOffsetX = 180; // Size of the grid cell
    const playersBufferFromMenu = 250;

    for (let i = 0; i < 4; i++) {
      // Positioning each player slot
      const slotX = (i * playerOffsetX) + menuWidth + playersBufferFromMenu + (playerOffsetX / 2);
      const slotY = playerSlotHeight / 2;
      this.add.rectangle(slotX, slotY, playerOffsetX, playerSlotHeight - 10, 0x333333);
      // Add player image
      this.add.image(slotX, slotY, 'player' + (i + 1)).setDisplaySize(playerOffsetX, playerSlotHeight - 10);
 
      this.colorArea(slotX, slotY, this.gameInfo.colors[i], 0.3, playerOffsetX - 15, playerSlotHeight - 10, playerOffsetX - 15, playerSlotHeight - 10);

      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        const lineX = (i * playerOffsetX) + menuWidth + playersBufferFromMenu;
        this.add.line(0, 0, lineX, 0, lineX, playerSlotHeight, 0xffffff).setOrigin(0, 0);
      }
    }

    this.turnIndicator = this.add.image(535, 50, 'turnIndicator').setDisplaySize(30, 30);

    // Draw the grid
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
    const cellSize = 150; // Size of the grid cell
    const cols = 8; // Number of columns
    const rows = 6; // Update number of rows to 8

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cellSize + menuWidth + (cellSize / 2);
        const y = j * cellSize + playerSlotHeight + (cellSize / 2);
        const randomPiece = 'mapPiece' + Phaser.Math.Between(1, 6); // Randomly choose a map piece
        this.add.image(x, y, randomPiece).setDisplaySize(cellSize - 3, cellSize - 3); // Scale the image to fit the cell
      }
    }

    // Draw the grid lines on top of the images
    for (let i = 0; i <= cols; i++) {
      graphics.moveTo(i * cellSize + menuWidth, playerSlotHeight);
      graphics.lineTo(i * cellSize + menuWidth, cellSize * rows + playerSlotHeight);
    }
    for (let j = 0; j <= rows; j++) {
      graphics.moveTo(menuWidth, j * cellSize + playerSlotHeight);
      graphics.lineTo(cellSize * cols + menuWidth, j * cellSize + playerSlotHeight);
    }
    graphics.strokePath();
  },
  // Methods to handle character addition and deletion
  addCharacter: function (index) {
    console.log('Add character at index:', index);
    // Add logic to add the character
  },

  deleteCharacter: function (index) {
    console.log('Delete character at index:', index);
    // Add logic to delete and replace the character
  },

  endTurn: function () {
    console.log('endTurn of player :' + this.gameInfo.activePlayerIndex);
    this.gameInfo.activePlayerIndex = (this.gameInfo.activePlayerIndex + 1) % 4; // Move to the next player
    if (((this.gameInfo.activePlayerIndex + 1) % 4) == 1) {
      this.gameInfo.date.week += 1;
      if (this.gameInfo.date.week == 5) {
        this.gameInfo.date.week = 1;
        this.gameInfo.date.month += 1;
        if (this.gameInfo.date.month == 13) {
          this.gameInfo.date.month = 1;
          this.gameInfo.date.year += 1;
        }
      }
      this.date.setText(this.gameInfo.date.year + 'K.' +
        this.gameInfo.monthsList[this.gameInfo.date.month - 1] +
        '.' + this.gameInfo.date.week);
    }
    this.updatePlayerIndicators(); // Update the visual indication for active player
  },

  updatePlayerIndicators: function () {
    console.log('updatePlayerIndicators to player :', this.gameInfo.activePlayerIndex);
    this.turnIndicator.setPosition(530 + this.gameInfo.activePlayerIndex * 180, 50)
  },

  colorArea: function (slotX, slotY, color, alpha, offSetStartX,offSetStartY, offSetEndX, offSetEndY) {
    // Graphics object for color overlay
    let colorOverlay = this.add.graphics({ x: slotX, y: slotY });

    // Draw the rectangle exactly over the image
    colorOverlay.fillStyle(color, alpha);
    colorOverlay.fillRect(
      -0.5 * (offSetStartX), // x position relative to the image
      -0.5 * (offSetStartY), // y position relative to the image
      offSetEndX, // width of the rectangle
      offSetEndY  // height of the rectangle
    );

    // Move the overlay to be exactly on top of the image
    colorOverlay.setDepth(1);
  }
});

export default {
  name: 'PhaserGame',
  mounted() {
    const config = {
      type: Phaser.AUTO,
      width: 1460, // grid width (600) + menu width (250)
      height: 980, // grid height (600) + players section (70)
      parent: 'phaser-game',
      scene: [gameScene]
    };

    new Phaser.Game(config);
  }
};
</script>

<style scoped>
#phaser-game {
  width: 100%;
  height: 100%;
  margin: auto;
}
</style>
