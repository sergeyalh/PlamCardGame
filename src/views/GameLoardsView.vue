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
      activePlayerCharactersOptions: [],
      monthsList: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
      colors: [0xFF0000, 0x008000, 0xFF6FFF, 0x0000FF],
      date: { year: 10, month: 1, week: 1 },
      map: [],
      players: [
        { nickname: "Jacob", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [] },
        { nickname: "Serg", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [] },
        { nickname: "Izov", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [] },
        { nickname: "Elad", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [] }
      ]
    };
  },

  preload: function () {
    // Load images
    for (let i = 1; i <= 6; i++) {
      this.load.image('mapPiece' + i, 'mapPieces/map' + i + '.png');
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image('player' + i, 'players/player' + i + '.png');
    }

    this.load.json('characters', 'characters.json');

    this.load.image('turnIndicator', '/clock.png');
  },
  create: function () {
    const characters = this.cache.json.get('characters');
    this.charactersData = characters.characters;
    for (let i = 0; i < this.charactersData.length; i++) {
      this.charactersData[i].image = this.load.image(this.charactersData[i].nickname, 'characters/' + this.charactersData[i].imagePath);
    }

    this.underbossChar = characters.underBoss;
    this.underbossChar.image = this.load.image(characters.underBoss.nickname, 'characters/' + characters.underBoss.imagePath);


    // After setting up all the loaders for the images, start the loading process
    this.load.once('complete', this.setupGame, this); // Setup the callback for when loading is complete
    this.load.start(); // Start the loader
  },
  setupGame: function () {
    // Create a menu panel
    this.menuWidth = 250;
    const menuHeight = this.game.config.height;
    this.add.rectangle(this.menuWidth / 2, menuHeight / 2, this.menuWidth, menuHeight, 0x333333);

    // Add some menu items
    this.date = this.add.text(66, 10, this.gameInfo.date.year + 'K.' +
      this.gameInfo.monthsList[this.gameInfo.date.month - 1] +
      '.' + this.gameInfo.date.week, { font: '16px Arial', fill: '#03fc2c' });


    // Create a box for the player info
    this.playerInfoBox = this.add.graphics();
    this.playerInfoBox.fillStyle(0x03fc2c, 0.8); // Dark background with some transparency
    this.playerInfoBox.fillRect(42, 50, 170, 70); // Adjust size and position as needed

    // Add End Turn Button
    const endTurnButton = this.add.text(85, 580, 'End Turn', { font: '20px Arial', fill: '#ff0000' }).setInteractive();
    endTurnButton.on('pointerdown', () => this.endTurn());

    this.characterSlotHeight = 120;
    this.panelHeight = 20; // Height for the bottom panel
    this.characterImageHeight = this.characterSlotHeight - this.panelHeight; // Remaining height for the image
    this.startYforChars = this.game.config.height - (this.characterSlotHeight * 3); // Position for the first character slot

    // Draw the character slots with images and interactive elements
    for (let i = 0; i < 3; i++) {
      const slotY = this.startYforChars + (i * this.characterSlotHeight);
      const panelY = slotY + this.characterImageHeight + (this.panelHeight / 2);

      // Create the character slot
      this.add.rectangle(this.menuWidth / 2, slotY + (this.characterImageHeight / 2), this.menuWidth, this.characterImageHeight, 0x444444);

      // Create the panel at the bottom of the slot
      this.add.rectangle(this.menuWidth / 2, panelY, this.menuWidth, this.panelHeight, 0x666666);

      // '+' Button in the panel
      const plusButton = this.add.text(this.menuWidth - 40, panelY - 10, '+', { font: '20px Arial', fill: '#00ff00' }).setInteractive();
      plusButton.on('pointerdown', () => this.addCharacter(i));

      // 'x' Button in the panel
      const deleteButton = this.add.text(this.menuWidth - 20, panelY - 12, 'x', { font: '20px Arial', fill: '#ff0000' }).setInteractive();
      deleteButton.on('pointerdown', () => this.deleteCharacter(i));

      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        this.add.line(0, 0, 0, slotY, this.menuWidth, slotY, 0xffffff).setOrigin(0, 0);
      }
    }

    // Draw the player slots
    const playerSlotHeight = 70; // Height of the players section
    const playerOffsetX = 180; // Size of the grid cell
    const playersBufferFromMenu = 250;

    for (let i = 0; i < 4; i++) {
      // Positioning each player slot
      const slotX = (i * playerOffsetX) + this.menuWidth + playersBufferFromMenu + (playerOffsetX / 2);
      const slotY = playerSlotHeight / 2;
      this.add.rectangle(slotX, slotY, playerOffsetX, playerSlotHeight - 10, 0x333333);
      // Add player image
      this.add.image(slotX, slotY, 'player' + (i + 1)).setDisplaySize(playerOffsetX, playerSlotHeight - 10);

      this.colorArea(slotX, slotY, this.gameInfo.colors[i], 0.3, playerOffsetX - 22, playerSlotHeight - 10);

      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        const lineX = (i * playerOffsetX) + this.menuWidth + playersBufferFromMenu;
        this.add.line(0, 0, lineX, 0, lineX, playerSlotHeight, 0xffffff).setOrigin(0, 0);
      }
    }

    this.turnIndicator = this.add.image(535, 50, 'turnIndicator').setDisplaySize(30, 30);

    // Draw the grid
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
    const cellSize = 150; // Size of the grid cell
    const cols = 8; // Number of columns
    const rows = 6; // Update number of rows to 8
    const gridStart = this.menuWidth + 10;

    for (let i = 0; i < cols; i++) {
      this.gameInfo.map[i] = [];
      for (let j = 0; j < rows; j++) {
        const x = i * cellSize + gridStart + (cellSize / 2);
        const y = j * cellSize + playerSlotHeight + (cellSize / 2);
        const randomPiece = 'mapPiece' + Phaser.Math.Between(1, 6); // Randomly choose a map piece
        let mapP = this.add.image(x, y, randomPiece).setDisplaySize(cellSize - 3, cellSize - 3); // Scale the image to fit the cell
        this.gameInfo.map[i][j] = {
          x: x,
          y: y,
          photo: mapP,
          color: null,
          owner: null
        };
      }
    }

    // Draw the grid lines on top of the images
    for (let i = 0; i <= cols; i++) {
      graphics.moveTo(i * cellSize + gridStart, playerSlotHeight);
      graphics.lineTo(i * cellSize + gridStart, cellSize * rows + playerSlotHeight);
    }
    for (let j = 0; j <= rows; j++) {
      graphics.moveTo(gridStart, j * cellSize + playerSlotHeight);
      graphics.lineTo(cellSize * cols + gridStart, j * cellSize + playerSlotHeight);
    }

    this.setStartMap();
    graphics.strokePath();

    this.updatePlayerInfo();
  },

  updatePlayerInfo: function () {
    const activePlayer = this.gameInfo.players[this.gameInfo.activePlayerIndex];
    if (!this.playerInfoText) {
      // Create it if it doesn't exist
      this.playerInfoText = this.add.text(47, 60, "", { font: '16px Arial', fill: '#ffffff', align: 'left', wordWrap: { width: 190 } });
    }

    // Format the text into multiple lines
    const infoText = [
      `Player: ${activePlayer.nickname}`,
      `Cash: $${activePlayer.cash}`,
      `Next Income: $${activePlayer.nextIncome}`
    ].join('\n'); // Join with new line characters

    // Update the text
    this.playerInfoText.setText(infoText);

    this.initCharactersOptionsView(this.gameInfo.activePlayerIndex);
  },

  setStartMap: function () {
    this.conquerTerritory(0, 1, 1);
    this.addUnderBoss(0, 1, 1);
    this.initCharactersOptions(0)

    //Init Characters for 1st player
    this.initCharactersOptionsView(0);

    this.conquerTerritory(1, 2, 4);
    this.addUnderBoss(1, 2, 4);
    this.initCharactersOptions(1)
    this.conquerTerritory(2, 5, 1);
    this.addUnderBoss(2, 5, 1);
    this.initCharactersOptions(2)
    this.conquerTerritory(3, 6, 4);
    this.addUnderBoss(3, 6, 4);
    this.initCharactersOptions(3)
  },

  initCharactersOptionsView: function (playerIndex) {
    for (let i = 0; i < this.gameInfo.players[playerIndex].availableCharacters.length; i++) {
      const slotY = this.startYforChars + (i * this.characterSlotHeight);
      const panelY = slotY + this.characterImageHeight + (this.panelHeight / 2);
      // Add character image
      this.gameInfo.activePlayerCharactersOptions[i] = {};
      this.gameInfo.activePlayerCharactersOptions[i].image = this.add.image(this.menuWidth / 2, slotY + (this.characterImageHeight / 2), this.gameInfo.players[playerIndex].availableCharacters[i].nickname).setDisplaySize(this.menuWidth - 3, this.characterImageHeight);

      // Cost Display in the panel
      this.gameInfo.activePlayerCharactersOptions[i].cost = this.add.text(20, panelY - 10, 'Cost: [' + this.gameInfo.players[playerIndex].availableCharacters[i].cost + ']', { font: '16px Arial', fill: '#ffffff' });

    }
  },

  clearCharactersOptionsView: function () {
    for (let i = 0; i < 3; i++) {
      this.gameInfo.activePlayerCharactersOptions[i].image.destroy();
      this.gameInfo.activePlayerCharactersOptions[i].cost.destroy();
    }
  },

  initCharactersOptions: function (playerIndex) {
    this.gameInfo.players[playerIndex].availableCharacters = [];
    let uniqeStartUpCharacters = this.generateUniqueRandomNumbers();
    for (let index = 0; index < 3; index++) {
      this.gameInfo.players[playerIndex].availableCharacters.push(this.charactersData[uniqeStartUpCharacters[index]]);
    }
  },

  generateUniqueRandomNumbers: function () {
    const uniqueNumbers = new Set();
    while (uniqueNumbers.size < 3) {
      const randomNumber = Math.floor(Math.random() * (this.charactersData.length)) + 0;
      uniqueNumbers.add(randomNumber);
    }
    return Array.from(uniqueNumbers);
  },
  addUnderBoss: function (playerIndex, mapX, mapY) {
    // Add UnderBoss for each player
    let underBossClone = { ...this.underbossChar };
    underBossClone.location = { x: mapX, y: mapY };
    this.gameInfo.players[playerIndex].activeCharacters.push(underBossClone);
    this.gameInfo.map[mapX][mapY].characters = [{ player: playerIndex, character: underBossClone }];

  },
  conquerTerritory: function (playerIndex, mapX, mapY) {
    let mapPiece = this.gameInfo.map[mapX][mapY];
    let color = this.gameInfo.colors[playerIndex];
    this.gameInfo.map[mapX][mapY].color = color;
    this.gameInfo.map[mapX][mapY].owner = playerIndex;
    this.colorArea(mapPiece.x, mapPiece.y, color, 0.4, 150, 150);
    this.gameInfo.players[playerIndex].underControlPieces.push({ x: mapX, y: mapY });
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
    this.clearCharactersOptionsView();
    this.updatePlayerIndicators(); // Update the visual indication for active player
    this.updatePlayerInfo(); // Update the player info display for the new active player
  },

  updatePlayerIndicators: function () {
    console.log('updatePlayerIndicators to player :', this.gameInfo.activePlayerIndex);
    this.turnIndicator.setPosition(530 + this.gameInfo.activePlayerIndex * 180, 50)
  },

  colorArea: function (slotX, slotY, color, alpha, width, height) {
    // Graphics object for color overlay
    let colorOverlay = this.add.graphics({ x: slotX, y: slotY });

    // Draw the rectangle exactly over the image
    colorOverlay.fillStyle(color, alpha);
    colorOverlay.fillRect(
      -0.5 * (width), // x position relative to the image
      -0.5 * (height), // y position relative to the image
      width, // width of the rectangle
      height  // height of the rectangle
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
      width: 1470, // grid width (600) + menu width (250)
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
