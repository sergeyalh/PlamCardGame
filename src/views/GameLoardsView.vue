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
  },

  create: function () {
    // Create a menu panel
    const menuWidth = 250;
    const menuHeight = this.game.config.height;
    this.add.rectangle(menuWidth / 2, menuHeight / 2, menuWidth, menuHeight, 0x333333);

    // Add some menu items
    this.add.text(20, 50, 'Item 1', { font: '16px Arial', fill: '#ffffff' });
    this.add.text(20, 100, 'Item 2', { font: '16px Arial', fill: '#ffffff' });
    // Add more menu items as needed
    
    // Draw the player slots
    const playerSlotHeight = 70; // Height of the players section
    const playerOffsetX = 150; // Size of the grid cell
    for (let i = 0; i < 4; i++) {
      // Positioning each player slot
      const slotX = (i * playerOffsetX) + menuWidth + (playerOffsetX / 2);
      const slotY = playerSlotHeight / 2;
      this.add.rectangle(slotX, slotY, playerOffsetX, playerSlotHeight - 10, 0x444444);
      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        const lineX = (i * playerOffsetX) + menuWidth;
        this.add.line(0, 0, lineX, 0, lineX, playerSlotHeight, 0xffffff).setOrigin(0, 0);
      }
    }

    // Draw the grid
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
    const cellSize = 100; // Size of the grid cell
    const gridSize = 6; // 6x6 grid
   
    for (let i = 0; i <= gridSize; i++) {
      graphics.moveTo(i * cellSize + menuWidth, playerSlotHeight);
      graphics.lineTo(i * cellSize + menuWidth, cellSize * gridSize + playerSlotHeight);
      graphics.moveTo(menuWidth, i * cellSize + playerSlotHeight);
      graphics.lineTo(cellSize * gridSize + menuWidth, i * cellSize + playerSlotHeight);
    }
    graphics.strokePath();
  }
});

export default {
  name: 'PhaserGame',
  mounted() {
    const config = {
      type: Phaser.AUTO,
      width: 850, // grid width (600) + menu width (250)
      height: 670, // grid height (600) + players section (70)
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
