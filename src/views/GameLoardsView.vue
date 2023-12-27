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
        { nickname: "Jacob", cash: 100, nextIncome: 0, activeCharacters: {}, availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Serg", cash: 100, nextIncome: 0, activeCharacters: {}, availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Izov", cash: 100, nextIncome: 0, activeCharacters: {}, availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null },
        { nickname: "Elad", cash: 100, nextIncome: 0, activeCharacters: {}, availableCharacters: [], nextTurnActions: {}, underControlPieces: [], pendingFiering: null, pendingHiring: null }
      ]
    };
  },

  preload: function () {
    this.load.image('characterLocation', 'ocupid.png');
    this.load.image('characterLocationUnderSiege', 'enemies.png');
    this.load.image('deleteIndicator', 'fierd.png');  // Load the deletion indicator image

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

    this.menuWidth = 250;
    this.menuHeight = this.game.config.height;
    this.characterSlotHeight = 120;
    this.panelHeight = 20; // Height for the bottom panel
    this.characterImageHeight = this.characterSlotHeight - this.panelHeight; // Remaining height for the image
    this.startYforChars = this.game.config.height - (this.characterSlotHeight * 3); // Position for the first character slot
    this.playerSlotHeight = 70; // Height of the players section
    this.playerOffsetX = 180; // Size of the grid cell
    this.playersBufferFromMenu = 250;

    // Grid values
    this.cellSize = 150; // Size of the grid cell
    this.battleGroungColums = 8; // Number of columns
    this.battleGroungColumsRows = 6; // Update number of rows to 8
    this.gridStart = this.menuWidth + 10;
  },
  setupGame: function () {
    // Create a menu panel

    this.add.rectangle(this.menuWidth / 2, this.menuHeight / 2, this.menuWidth, this.menuHeight, 0x333333);

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

    for (let i = 0; i < this.battleGroungColums; i++) {
      this.gameInfo.map[i] = [];
      for (let j = 0; j < this.battleGroungColumsRows; j++) {
        const x = i * this.cellSize + this.gridStart + (this.cellSize / 2);
        const y = j * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
        const randomPiece = 'mapPiece' + Phaser.Math.Between(1, 6); // Randomly choose a map piece
        let mapP = this.add.image(x, y, randomPiece).setDisplaySize(this.cellSize - 3, this.cellSize - 3); // Scale the image to fit the cell
        this.gameInfo.map[i][j] = {
          charactersOnMapPiece: [],
          x: x,
          y: y,
          photo: mapP,
          color: null,
          owner: null
        };
      }
    }

    // Draw the grid lines on top of the images
    for (let i = 0; i <= this.battleGroungColums; i++) {
      graphics.moveTo(i * this.cellSize + this.gridStart, this.playerSlotHeight);
      graphics.lineTo(i * this.cellSize + this.gridStart, this.cellSize * this.battleGroungColumsRows + this.playerSlotHeight);
    }
    for (let j = 0; j <= this.battleGroungColumsRows; j++) {
      graphics.moveTo(this.gridStart, j * this.cellSize + this.playerSlotHeight);
      graphics.lineTo(this.cellSize * this.battleGroungColums + this.gridStart, j * this.cellSize + this.playerSlotHeight);
    }

    this.setStartMap();
    graphics.strokePath();

    this.updatePlayerInfo();
  },

  updateCharacterIcons: function () {
    // Create a set to track unique locations
    let locationsUnderControlAndCharactersCounter = {};

    // Get the active player's characters
    const activePlayerCharacters = this.gameInfo.players[this.gameInfo.activePlayerIndex].activeCharacters;

    // Loop through each character and add their location to the set
    Object.values(activePlayerCharacters).forEach(character => {
      // Assuming character.location holds an object with x and y
      const locationKey = `${character.location.x},${character.location.y}`; // Create a unique key for the location
      if (!locationsUnderControlAndCharactersCounter[locationKey]){
        locationsUnderControlAndCharactersCounter[locationKey] = 1;
      } else {
        locationsUnderControlAndCharactersCounter[locationKey] = +1;
      }
    });

    // Now, place an icon for each unique location
    Object.keys(locationsUnderControlAndCharactersCounter).forEach(locationKey => {
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

      // Check if there are enemies on this piece of map
      let iconEnemies = null;
      if(this.gameInfo.map[x][y].charactersOnMapPiece.length > locationsUnderControlAndCharactersCounter[locationKey]){
        iconEnemies = this.add.image(xOnMap, yOnMap, 'characterLocationUnderSiege');
        iconEnemies.setDisplaySize(105, 105); // Adjust size as needed
        iconEnemies.setDepth(5);
      }
     
      this.gameInfo.activPlayereCharactersLocationIcons.push({icon:icon, enemies: iconEnemies}); // Keep track of the icons for clearing later
    });
  },

  getCharactersAtLocation: function (x, y) {
    // Assuming you have a 2D array for the map and each cell holds character information
    let characters = this.gameInfo.map[x][y].charactersOnMapPiece;
    return characters || [];
  },

  createOverlay: function () {
    const overlay = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000);
    overlay.setOrigin(0, 0); // Top-left corner
    overlay.setAlpha(0.2); // Semi-transparent
    overlay.setDepth(6); // Ensure it's below the popup but above other game elements
    overlay.setInteractive(); // Block clicks
    this.overlay = overlay;
  },

  showCharactersPopup: function (x, y) {
    // Close any existing popups
    this.closePopup();

    // Create an overlay
    this.createOverlay();

    // Create a new popup at the center of the game
    const popupX = this.game.config.width / 2 + 125;
    const popupY = this.game.config.height / 2 + 36;

    // Create a new container for the popup elements
    this.charactersPopup = this.add.container(popupX, popupY);

    // Create the background for the popup
    const background = this.add.rectangle(0, 0, 1170, 880, 0x000000);
    background.setAlpha(0.7);
    this.charactersPopup.add(background);

    // Create a close button
    const closeButton = this.add.text(570, -438, 'X', { fontSize: '20px', fill: '#ff0044' });
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      // Close and remove the popup
      this.closePopup();
    });
    this.charactersPopup.add(closeButton);

    const allCharactersOnThisPiece = this.getCharactersAtLocation(x, y);
    const yInitialOffSet = -360; // Start a bit below the top of the popup
    let yOffset = yInitialOffSet
    let xOffset = -550; // Start a bit below the top of the popup
    let xEnemyOffset = 350;
    let yEnempyOffset = yInitialOffSet
    let charactersPerColumn = 5; // Number of characters per column
    let columnWidth = 100; // Adjust based on image size and desired spacing
    let characterCount = 0; // Track the number of characters processed
    let enemyCharacterCount = 0;
    allCharactersOnThisPiece.forEach(element => {
      if (element.player === this.gameInfo.activePlayerIndex) {
        characterCount += 1;
        // Add the character's image to the popup
        let charImage = this.add.image(xOffset + 110, yOffset, element.character.nickname); // use element.character.imagePath or similar
        charImage.setDisplaySize(220, 90); // Adjust size as needed
        this.charactersPopup.add(charImage);

        // Draw a border around the character's image
        let borderWidth = 2; // Width of the border
        let border = this.add.graphics();
        border.lineStyle(borderWidth, 0xffffff, 1); // White border, but you can change color
        border.strokeRect(
          xOffset + 110 - charImage.displayWidth / 2 - borderWidth / 2,
          yOffset - charImage.displayHeight / 2 - borderWidth / 2,
          charImage.displayWidth + borderWidth,
          charImage.displayHeight + borderWidth
        );
        this.charactersPopup.add(border); // Add the border to the popup

        // Add the character's nickname text on top of the image
        let playerText = this.add.text(xOffset, yOffset + 30, element.character.nickname, { fontSize: '16px', fill: '#ffffff' });
        this.charactersPopup.add(playerText);

        // Check if we need to move to the next column
        if (characterCount % charactersPerColumn === 0) {
          xOffset += columnWidth + 110 + 15; // Move to the next column
          yOffset = yInitialOffSet; // Reset Y position for the top of the new column
        } else {
          yOffset += 93;  // Move down for the next entry, ensuring space for image and text
        }
      } else {
        enemyCharacterCount += 1;
        // Add the character's image to the popup
        let charImage = this.add.image(xEnemyOffset + 110, yEnempyOffset, element.character.nickname); // use element.character.imagePath or similar
        charImage.setDisplaySize(220, 90); // Adjust size as needed
        this.charactersPopup.add(charImage);

        // Draw a border around the character's image
        let borderWidth = 2; // Width of the border
        let border = this.add.graphics();
        border.lineStyle(borderWidth, this.gameInfo.colors[element.player], 1); // White border, but you can change color
        border.strokeRect(
          xEnemyOffset + 110 - charImage.displayWidth / 2 - borderWidth / 2,
          yEnempyOffset - charImage.displayHeight / 2 - borderWidth / 2,
          charImage.displayWidth + borderWidth,
          charImage.displayHeight + borderWidth
        );
        this.charactersPopup.add(border); // Add the border to the popup

        // Add the character's nickname text on top of the image
        let playerText = this.add.text(xEnemyOffset, yEnempyOffset + 30, element.character.nickname, { fontSize: '16px', fill: '#ffffff' });
        this.charactersPopup.add(playerText);

        // Check if we need to move to the next column
        if (enemyCharacterCount % charactersPerColumn === 0) {
          xEnemyOffset += -columnWidth - 110 - 15; // Move to the next column
          yEnempyOffset = yInitialOffSet; // Reset Y position for the top of the new column
        } else {
          yEnempyOffset += 93;  // Move down for the next entry, ensuring space for image and text
        }
      }
    });

    // Set the entire container to a higher depth so it appears on top
    this.charactersPopup.setDepth(7);
  },

  closePopup: function () {
    // Destroy the container and all its child elements
    if (this.charactersPopup) {
      this.charactersPopup.destroy();
      this.charactersPopup = null;
    }

    // Also destroy the overlay
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
  },

  clearCharacterLocationIcons: function () {
    // Remove all character location icons from the map
    this.gameInfo.activPlayereCharactersLocationIcons.forEach(location => {
      location.icon.destroy();
      if (location.enemies){
        location.enemies.destroy()
      }
    });
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
    const uid = function () {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    underBossClone.id = uid;
    this.gameInfo.players[playerIndex].activeCharacters[uid] = underBossClone;
    this.gameInfo.map[mapX][mapY].charactersOnMapPiece.push({ player: playerIndex, character: underBossClone });

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
