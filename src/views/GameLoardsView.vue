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
      activPlayereCharactersLocationIcons: [],
      monthsList: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"],
      colors: [0xFF0000, 0x008000, 0xFF6FFF, 0x0000FF],
      date: { year: 10, month: 1, week: 1 },
      map: [],
      players: [
        { nickname: "Jacob", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Serg", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Izov", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Elad", cash: 100, nextIncome: 0, activeCharacters: [], availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null }
      ]
    };
  },

  preload: function () {
    this.load.image('characterLocation', 'ocupid.png');
    this.load.image('deleteIndicator', 'fierd.png');  // Load the deletion indicator image

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
    this.playerSlotHeight = 70; // Height of the players section
    this.playerOffsetX = 180; // Size of the grid cell
    this.playersBufferFromMenu = 250;

    for (let i = 0; i < 4; i++) {
      // Positioning each player slot
      const slotX = (i * this.playerOffsetX) + this.menuWidth + this.playersBufferFromMenu + (this.playerOffsetX / 2);
      const slotY = this.playerSlotHeight / 2;
      this.add.rectangle(slotX, slotY, this.playerOffsetX, this.playerSlotHeight - 10, 0x333333);
      // Add player image
      this.add.image(slotX, slotY, 'player' + (i + 1)).setDisplaySize(this.playerOffsetX, this.playerSlotHeight - 10);

      this.colorArea(slotX, slotY, this.gameInfo.colors[i], 0.3, this.playerOffsetX - 22, this.playerSlotHeight - 10);

      // Draw a line between the slots if it's not the first slot
      if (i > 0) {
        const lineX = (i * this.playerOffsetX) + this.menuWidth + this.playersBufferFromMenu;
        this.add.line(0, 0, lineX, 0, lineX, this.playerSlotHeight, 0xffffff).setOrigin(0, 0);
      }
    }

    this.turnIndicator = this.add.image(535, 50, 'turnIndicator').setDisplaySize(30, 30);

    // Draw the grid
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff } });
    this.cellSize = 150; // Size of the grid cell
    const cols = 8; // Number of columns
    const rows = 6; // Update number of rows to 8
    this.gridStart = this.menuWidth + 10;

    for (let i = 0; i < cols; i++) {
      this.gameInfo.map[i] = [];
      for (let j = 0; j < rows; j++) {
        const x = i * this.cellSize + this.gridStart + (this.cellSize / 2);
        const y = j * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
        const randomPiece = 'mapPiece' + Phaser.Math.Between(1, 6); // Randomly choose a map piece
        let mapP = this.add.image(x, y, randomPiece).setDisplaySize(this.cellSize - 3, this.cellSize - 3); // Scale the image to fit the cell
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
      graphics.moveTo(i * this.cellSize + this.gridStart, this.playerSlotHeight);
      graphics.lineTo(i * this.cellSize + this.gridStart, this.cellSize * rows + this.playerSlotHeight);
    }
    for (let j = 0; j <= rows; j++) {
      graphics.moveTo(this.gridStart, j * this.cellSize + this.playerSlotHeight);
      graphics.lineTo(this.cellSize * cols + this.gridStart, j * this.cellSize + this.playerSlotHeight);
    }

    this.setStartMap();
    graphics.strokePath();

    this.updatePlayerInfo();
  },

  updateCharacterIcons: function () {
    // Create a set to track unique locations
    let uniqueLocations = new Set();

    // Get the active player's characters
    const activePlayerCharacters = this.gameInfo.players[this.gameInfo.activePlayerIndex].activeCharacters;

    // Loop through each character and add their location to the set
    activePlayerCharacters.forEach(character => {
      // Assuming character.location holds an object with x and y
      const locationKey = `${character.location.x},${character.location.y}`; // Create a unique key for the location
      uniqueLocations.add(locationKey);
    });

    // Now, place an icon for each unique location
    uniqueLocations.forEach(locationKey => {
      const [x, y] = locationKey.split(',').map(Number);
      const xOnMap = x * this.cellSize + this.gridStart + (this.cellSize / 2);
      const yOnMap = y * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
      let icon = this.add.image(xOnMap, yOnMap, 'characterLocation');
      icon.setDisplaySize(50, 50); // Adjust size as needed
      icon.setDepth(5);

      // Make the icon interactive
      icon.setInteractive();

      // Add a click event listener to the icon
      icon.on('pointerdown', () => {
        this.showCharactersPopup(x, y);
      });
      this.gameInfo.activPlayereCharactersLocationIcons.push(icon); // Keep track of the icons for clearing later
    });
  },

  showCharactersPopup: function (x,y) {
    // Close any existing popups
    this.closePopup();

    console.log(x+":"+y)
    // Create a new popup at the center of the game
    const popupX = this.game.config.width / 2 + 120;
    const popupY = this.game.config.height / 2 + 36;

    // Create a new container for the popup elements
    this.charactersPopup = this.add.container(popupX, popupY);

    // Create the background for the popup
    const background = this.add.rectangle(0, 0, 1000, 800, 0x000000);
    background.setAlpha(0.8);
    this.charactersPopup.add(background);

    // Create a close button
    const closeButton = this.add.text(485, -398, 'X', { fontSize: '20px', fill: '#ff0044' });
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      // Close and remove the popup
      this.closePopup();
    });
    this.charactersPopup.add(closeButton);

    // Set the entire container to a higher depth so it appears on top
    this.charactersPopup.setDepth(6);
  },

  closePopup: function () {
    // Destroy the container and all its child elements
    if (this.charactersPopup) {
      this.charactersPopup.destroy();
      this.charactersPopup = null;
    }
  },

  clearCharacterLocationIcons: function () {
    // Remove all character location icons from the map
    this.gameInfo.activPlayereCharactersLocationIcons.forEach(icon => icon.destroy());
    this.gameInfo.activPlayereCharactersLocationIcons = []; // Reset the array after clearing
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

    this.addUnderBoss(1, 2, 4);
    this.conquerTerritory(1, 2, 4);
    this.updateCharacterIcons();

    this.initCharactersOptions(1)
    this.conquerTerritory(2, 5, 1);
    this.addUnderBoss(2, 5, 1);
    this.initCharactersOptions(2)
    this.conquerTerritory(3, 6, 4);
    this.addUnderBoss(3, 6, 4);
    this.initCharactersOptions(3);
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
    if (this.deleteIcon) {
      this.deleteIcon.destroy();
    }
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

  deleteCharacterAndAddNewUniqeRandomCharacter: function () {
    let playerIndex = this.gameInfo.activePlayerIndex;
    let indexToRemove = this.gameInfo.players[playerIndex].pendingFiering;
    let mapOfCurrentCharactersByNickNames = {};
    for (let i = 0; i < 3; i++) {
      mapOfCurrentCharactersByNickNames[this.gameInfo.players[playerIndex].availableCharacters[i].nickname] = i;
    }
    let foundCharToAdd = false;
    while (!foundCharToAdd) {
      const randomNumber = Math.floor(Math.random() * (this.charactersData.length)) + 0;
      if ((mapOfCurrentCharactersByNickNames[this.charactersData[randomNumber].nickname]) === undefined) {
        this.gameInfo.players[playerIndex].availableCharacters[indexToRemove] = this.charactersData[randomNumber];
        foundCharToAdd = true;
      }
    }
    this.gameInfo.players[playerIndex].pendingFiering = null;
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
    if (this.deleteIcon) {
      this.deleteIcon.destroy();
    }
    const slotY = this.startYforChars + 50 + index * 120;
    const panelY = 0 + 125;

    // Add a transparent overlay or a deletion icon on the character's image
    this.deleteIcon = this.add.image(panelY, slotY, 'deleteIndicator').setDisplaySize(this.menuWidth - 3, this.characterImageHeight);
    this.deleteIcon.setAlpha(0.3); // Make it semi-transparent
    // character.deleteIcon = deleteIcon; // Store the reference for future use
    console.log('Delete character at index:', index);
    this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering = index;

  },

  endTurn: function () {
    if (this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering !== null) {
      this.deleteCharacterAndAddNewUniqeRandomCharacter();
    }

    // Clear existing character location icons if any
    this.clearCharacterLocationIcons();

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

    this.updateCharacterIcons();
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
