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
    this.load.image('incommingLocation', 'hireingIndic.png');
    this.load.image('noCash', 'noCash.png');
    this.load.image('deleteIndicator', 'fierd.png');  // Load the deletion indicator image
    this.load.image('addIndicator', 'hierd.png');  // Load the add indicator image

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

    for (let i = 0; i < this.battleGroungColumsRows; i++) {
      this.gameInfo.map[i] = [];
      for (let j = 0; j < this.battleGroungColums; j++) {
        const x = j * this.cellSize + this.gridStart + (this.cellSize / 2);
        const y = i * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
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
    this.updatePlayerInfo();
    graphics.strokePath();
  },

  updateCharacterIcons: function () {
    // Create a set to track unique locations
    let locationsUnderControlAndCharactersCounter = {};

    // Get the active player's characters
    const activePlayerCharacters = this.gameInfo.players[this.gameInfo.activePlayerIndex].activeCharacters;

    // Loop through each character and add their location to the set
    Object.values(activePlayerCharacters).forEach(character => {
      // Assuming character.location holds an object with x and y
      const locationKey = `${character.location.y},${character.location.x}`; // Create a unique key for the location
      if (!locationsUnderControlAndCharactersCounter[locationKey]) {
        locationsUnderControlAndCharactersCounter[locationKey] = 1;
      } else {
        locationsUnderControlAndCharactersCounter[locationKey] += 1;
      }
    });

    // Now, place an icon for each unique location
    Object.keys(locationsUnderControlAndCharactersCounter).forEach(locationKey => {
      const [y, x] = locationKey.split(',').map(Number);
      const xOnMap = x * this.cellSize + this.gridStart + (this.cellSize / 2);
      const yOnMap = y * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
      let icon = this.add.image(xOnMap, yOnMap, 'characterLocation');
      icon.setDisplaySize(50, 50); // Adjust size as needed
      icon.setDepth(5);

      // Make the icon interactive
      icon.setInteractive();

      // Add a click event listener to the icon
      icon.on('pointerdown', () => {
        this.showMapPopup(x, y);
      });

      // Check if there are enemies on this piece of map
      let iconEnemies = null;
      if (this.gameInfo.map[y][x].charactersOnMapPiece.length > locationsUnderControlAndCharactersCounter[locationKey]) {
        iconEnemies = this.add.image(xOnMap, yOnMap, 'characterLocationUnderSiege');
        iconEnemies.setDisplaySize(105, 105); // Adjust size as needed
        iconEnemies.setDepth(5);
      }

      this.gameInfo.activPlayereCharactersLocationIcons.push({ icon: icon, enemies: iconEnemies }); // Keep track of the icons for clearing later
    });
  },

  getCharactersAtLocation: function (x, y) {
    // Assuming you have a 2D array for the map and each cell holds character information
    let characters = this.gameInfo.map[y][x].charactersOnMapPiece;
    return characters || [];
  },

  createOverlay: function (startX, startY, width, height, depth = 6) {
    const overlay = this.add.rectangle(startX, startY, width, height, 0x000000);
    overlay.setOrigin(0, 0); // Top-left corner
    overlay.setAlpha(0.2); // Semi-transparent
    overlay.setDepth(depth); // Ensure it's below the popup but above other game elements
    overlay.setInteractive(); // Block clicks
    return overlay;
  },

  showCharacterPopup: function (character) {

    // Dimensions for the popup
    let popupWidth = 400;
    let popupHeight = 600;

    // Create a container for the popup
    this.characterInfoPopup = this.add.container(this.game.config.width / 2, this.game.config.height / 2);

    // Create a semi-transparent background
    let bg = this.add.rectangle(0, 0, popupWidth, popupHeight, 0x000000);
    bg.setAlpha(0.8);
    this.characterInfoPopup.add(bg);

    // Add a white border around the popup
    let border = this.add.rectangle(0, 0, popupWidth, popupHeight);
    border.setStrokeStyle(2, 0xffffff);  // 2 is the line thickness, 0xffffff is the color white
    this.characterInfoPopup.add(border);

    // Add character image
    let charImage = this.add.image(0, -203, character.nickname).setDisplaySize(350, 150);
    this.characterInfoPopup.add(charImage);

    // Add character information
    let yOffset = -30; // Start position for character information text

    let nickNametext = `${character['nickname']}`;
    let nickNameTextBlock = this.add.text(0, -128, nickNametext, { fontSize: '16px', fontStyle: 'bold' , fill: '#ffffff', wordWrap: { width: 350 }, align: 'center' });
    nickNameTextBlock.setOrigin(0.5, 0);
    this.characterInfoPopup.add(nickNameTextBlock);
    let descriptiontext = `${character['description']}`;
    let descriptiontextBlock = this.add.text(0, -108, descriptiontext, { fontSize: '16px', fill: '#ffffff', wordWrap: { width: 350 }, align: 'center' });
    descriptiontextBlock.setOrigin(0.5, 0);
    this.characterInfoPopup.add(descriptiontextBlock);

    const excludeKeys = ["Level", "XP", "description", "nickname", "imagePath", "location", "visualDescription", "image", "id"];  // Array of keys to exclude
    Object.keys(character).forEach(key => {
      // Skip imagePath to not display it as text

      if (!excludeKeys.includes(key)) {
        let text = `${key}: ${character[key]}`;
        let infoText = this.add.text(-180, yOffset, text, { fontSize: '16px', fill: '#ffffff', wordWrap: { width: 350 } });
        this.characterInfoPopup.add(infoText);
        yOffset += 20; // Increment y position for next piece of information
      }
    });

    let overLay = this.createOverlay(0, 0, this.game.config.width, this.game.config.height, 8);

    // Add a close button or area
    let closeButton = this.add.text(185, -300, 'X', { fontSize: '20px', fill: '#ff0000' });
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      this.characterInfoPopup.destroy(); // Destroy the popup when close is clicked
      this.removeOverLay(overLay);
    });
    this.characterInfoPopup.add(closeButton);

    let characterLevel = character['Level'];
    if (characterLevel) {
      let levelText = `LVL:` + characterLevel;
      let levelTextBlock = this.add.text(100, -40, levelText, { fontSize: '16px', fill: '#ffffff', wordWrap: { width: 350 }, align: 'center' });
      levelTextBlock.setOrigin(0.5, 0);
      this.characterInfoPopup.add(levelTextBlock);
    }

    let characterXP = character['XP'];
    if (characterXP || characterXP == 0) {
      let xpText = `XP:` + characterLevel;
      let xpTextBlock = this.add.text(100, -20, xpText, { fontSize: '16px', fill: '#ffffff', wordWrap: { width: 350 }, align: 'center' });
      xpTextBlock.setOrigin(0.5, 0);
      this.characterInfoPopup.add(xpTextBlock);
    }

    this.characterInfoPopup.add(descriptiontextBlock);

    // Centering the popup container
    this.characterInfoPopup.setSize(400, 600);
    this.characterInfoPopup.setDepth(9); // Ensure the popup is above other game elements
  },

  showMapPopup: function (x, y) {
    // Close any existing popups
    this.closeMapPopup();

    // Create an overlay
    let overLay = this.createOverlay(0, 0, this.game.config.width, this.game.config.height);

    // Create a new popup at the center of the game
    const popupX = this.game.config.width / 2 + 125;
    const popupY = this.game.config.height / 2 + 36;

    // Create a new container for the popup elements
    this.mapPopup = this.add.container(popupX, popupY);

    // Add a white border around the popup
    let border = this.add.rectangle(0, 0, 1170, 880);
    border.setStrokeStyle(2, 0xffffff);  // 2 is the line thickness, 0xffffff is the color white
    this.mapPopup.add(border);

    // Create the background for the popup
    const background = this.add.rectangle(0, 0, 1170, 880, 0x000000);
    background.setAlpha(0.7);
    this.mapPopup.add(background);

    // Create a close button
    const closeButton = this.add.text(570, -438, 'X', { fontSize: '20px', fill: '#ff0044' });
    closeButton.setInteractive();
    closeButton.on('pointerdown', () => {
      // Close and remove the popup
      this.closeMapPopup();
      this.removeOverLay(overLay)
    });
    this.mapPopup.add(closeButton);

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
        charImage.setInteractive();

        charImage.on('pointerdown', () => {
          this.showCharacterPopup(element.character);
        });
        this.mapPopup.add(charImage);

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
        this.mapPopup.add(border); // Add the border to the popup

        // Add the character's nickname text on top of the image
        let playerText = this.add.text(xOffset, yOffset + 30, element.character.nickname, { fontSize: '16px', fill: '#ffffff' });
        this.mapPopup.add(playerText);

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
        charImage.setInteractive();

        charImage.on('pointerdown', () => {
          this.showCharacterPopup(element.character);
        });


        this.mapPopup.add(charImage);

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
        this.mapPopup.add(border); // Add the border to the popup

        // Add the character's nickname text on top of the image
        let playerText = this.add.text(xEnemyOffset, yEnempyOffset + 30, element.character.nickname, { fontSize: '16px', fill: '#ffffff' });
        this.mapPopup.add(playerText);

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
    this.mapPopup.setDepth(7);
  },

  closeMapPopup: function () {
    // Destroy the container and all its child elements
    if (this.mapPopup) {
      this.mapPopup.destroy();
      this.mapPopup = null;
    }
  },

  removeOverLay: function (overLay) {
    if (overLay) {
      overLay.destroy();
      overLay = null;
    }
  },

  clearCharacterLocationIcons: function () {
    // Remove all character location icons from the map
    this.gameInfo.activPlayereCharactersLocationIcons.forEach(location => {
      location.icon.destroy();
      if (location.enemies) {
        location.enemies.destroy()
      }
    });

    if (this.incommingIcon) {
      this.incommingIcon.destroy();
    }
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
    this.addUnderBoss(1, 1, 1);
    this.initCharactersOptions(0)

    this.addUnderBoss(1, 4, 2);
    this.conquerTerritory(1, 4, 2);
    this.updateCharacterIcons();

    this.initCharactersOptions(1)
    this.conquerTerritory(2, 1, 5);
    this.addUnderBoss(2, 1, 5);
    this.initCharactersOptions(2)

    this.conquerTerritory(3, 4, 6);
    this.addUnderBoss(3, 4, 6);
    this.initCharactersOptions(3);
  },

  initCharactersOptionsView: function (playerIndex) {
    for (let i = 0; i < this.gameInfo.players[playerIndex].availableCharacters.length; i++) {
      const slotY = this.startYforChars + (i * this.characterSlotHeight);
      const panelY = slotY + this.characterImageHeight + (this.panelHeight / 2);
      // Add character image
      this.gameInfo.activePlayerCharactersOptions[i] = {};
      this.gameInfo.activePlayerCharactersOptions[i].image = this.add.image(this.menuWidth / 2, slotY + (this.characterImageHeight / 2), this.gameInfo.players[playerIndex].availableCharacters[i].nickname).setDisplaySize(this.menuWidth - 3, this.characterImageHeight);
      this.gameInfo.activePlayerCharactersOptions[i].image.setInteractive();

      this.gameInfo.activePlayerCharactersOptions[i].image.on('pointerdown', () => {
        this.showCharacterPopup(this.gameInfo.players[playerIndex].availableCharacters[i]);
      });

      // Cost Display in the panel
      this.gameInfo.activePlayerCharactersOptions[i].cost = this.add.text(20, panelY - 10, 'Cost: [' + this.gameInfo.players[playerIndex].availableCharacters[i].Cost + ']', { font: '16px Arial', fill: '#ffffff' });
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

  addCharacterAndAddNewUniqeRandomCharacter: function () {
    let playerIndex = this.gameInfo.activePlayerIndex;
    let charToAdd = this.gameInfo.players[playerIndex].pendingHiring;
    let mapOfCurrentCharactersByNickNames = {};
    for (let i = 0; i < 3; i++) {
      mapOfCurrentCharactersByNickNames[this.gameInfo.players[playerIndex].availableCharacters[i].nickname] = i;
    }
    let foundCharToAdd = false;
    while (!foundCharToAdd) {
      const randomNumber = Math.floor(Math.random() * (this.charactersData.length)) + 0;
      if ((mapOfCurrentCharactersByNickNames[this.charactersData[randomNumber].nickname]) === undefined) {
        // Add to Map And Add to th player
        let charToAddInfo = { ...this.gameInfo.players[playerIndex].availableCharacters[charToAdd.index] };
        let mapX = charToAdd.selectedX;
        let mapY = charToAdd.selectedY;
        charToAddInfo.location = { x: mapX, y: mapY };
        const uid = this.createUid();
        charToAddInfo.id = uid;
        charToAddInfo.XP = 0;
        charToAddInfo.Level = 1;
        this.gameInfo.activePlayerCharactersOptions[charToAdd.index].image.destroy();
        this.gameInfo.activePlayerCharactersOptions[charToAdd.index].cost.destroy();
        this.gameInfo.players[playerIndex].activeCharacters[uid] = charToAddInfo;
        this.gameInfo.map[mapY][mapX].charactersOnMapPiece.push({ player: playerIndex, character: charToAddInfo });
        // Remove the cost from players Cash
        this.gameInfo.players[playerIndex].cash -= charToAddInfo.Cost;
        console.log(charToAddInfo.Cost);
        this.gameInfo.players[playerIndex].availableCharacters[charToAdd.index] = this.charactersData[randomNumber];
        foundCharToAdd = true;
      }
    }

    this.gameInfo.players[playerIndex].pendingHiring = null;
  },

  createUid: function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  addUnderBoss: function (playerIndex, mapY, mapX) {
    // Add UnderBoss for each player
    let underBossClone = { ...this.underbossChar };
    underBossClone.location = { x: mapX, y: mapY };
    const uid = this.createUid();
    underBossClone.id = uid;
    underBossClone.XP = 0;
    underBossClone.Level = 1;
    this.gameInfo.players[playerIndex].activeCharacters[uid] = underBossClone;
    this.gameInfo.map[mapY][mapX].charactersOnMapPiece.push({ player: playerIndex, character: underBossClone });

  },
  conquerTerritory: function (playerIndex, mapY, mapX) {
    let mapPiece = this.gameInfo.map[mapY][mapX];
    let color = this.gameInfo.colors[playerIndex];
    mapPiece.color = color;
    mapPiece.owner = playerIndex;
    this.colorArea(mapPiece.x, mapPiece.y, color, 0.4, 150, 150);
    this.gameInfo.players[playerIndex].underControlPieces.push({ x: mapX, y: mapY });
  },

  handleMapPieceSelecetionForAdding: function (slotY, panelY, index, playerIndex, cancelButton, promptText, y, x, overLay) {
    if (this.addIcon) {
      this.addIcon.destroy();
      this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingHiring = null;
    }

    if (this.incommingIcon) {
      this.incommingIcon.destroy();
    }

    // Add a transparent overlay or a deletion icon on the character's image
    this.addIcon = this.add.image(panelY, slotY, 'addIndicator').setDisplaySize(this.menuWidth - 3, this.characterImageHeight);
    this.addIcon.setAlpha(0.3); // Make it semi-transparent
    // character.deleteIcon = deleteIcon; // Store the reference for future use
    this.gameInfo.players[playerIndex].pendingHiring = { index, selectedX: x, selectedY: y };

    // Add Incomming icon
    const xOnMap = x * this.cellSize + this.gridStart + (this.cellSize / 2);
    const yOnMap = y * this.cellSize + this.playerSlotHeight + (this.cellSize / 2);
    this.incommingIcon = this.add.image(xOnMap, yOnMap, 'incommingLocation');
    this.incommingIcon.setDisplaySize(170, 170); // Adjust size as needed
    this.incommingIcon.setDepth(5);

    // Hide or destroy the prompt and cancel button after selection
    this.cancelHiringProcess(promptText, cancelButton, overLay);
  },

  makeMapInteractiveForCharacterLocation: function (slotY, panelY, index, cancelButton, promptText, overLay) {
    // Iterate over each cell or area in your map
    this.gameInfo.map.forEach((row, y) => {
      row.forEach((cell, x) => {
        // Assuming each cell has a sprite or image representing it
        cell.photo.setInteractive();
        cell.photo.on('pointerdown', () => {
          console.log(x + ":" + y + " owned by player:" + this.gameInfo.map[y][x].owner);

          if (this.gameInfo.map[y][x].owner === this.gameInfo.activePlayerIndex) {
            this.handleMapPieceSelecetionForAdding(slotY, panelY, index, this.gameInfo.activePlayerIndex, cancelButton, promptText, y, x, overLay);
          }
        });
      });
    });
  },

  cancelHiringProcess: function (promptText, cancelButton, overLay) {
    // Existing cleanup code...
    promptText.destroy();
    cancelButton.destroy();
    this.removeOverLay(overLay);

    // Reset the map's interactive state
    this.makeMapNonInteractive();
  },

  makeMapNonInteractive: function () {
    // Assuming this.gameInfo.map is a 2D array of cell objects
    this.gameInfo.map.forEach(row => {
      row.forEach(cell => {
        // Disable interactivity for each cell
        cell.photo.disableInteractive();
      });
    });
  },

  // Methods to handle character addition and deletion
  addCharacter: function (index) {
    const playerIndex = this.gameInfo.activePlayerIndex;
    if (!this.gameInfo.players[playerIndex].pendingHiring || index !== this.gameInfo.players[playerIndex].pendingHiring.index) {
      this.clearAddOrDeleteCharacteIcons();
      const slotY = this.startYforChars + 50 + index * 120;
      const panelY = 0 + 125;
      // Check if there is enough availabe cash for the selected character
      if (this.gameInfo.players[playerIndex].availableCharacters[index].Cost <= this.gameInfo.players[playerIndex].cash) {
        let overLay = this.createOverlay(0, 0, this.menuWidth, this.game.config.height);

        // Display the message or button
        let promptText = this.add.text(panelY, slotY, 'Please select where you want the character or Cancel', { fontSize: '20px', fill: '#ffffff', wordWrap: { width: this.menuWidth } });
        promptText.setOrigin(0.5, 0.5); // Center the text
        promptText.setDepth(7);

        // If you want a cancel button as well, add it here
        let cancelButton = this.add.text(panelY - 35, slotY + 30, 'Cancel', { fontSize: '20px', fill: '#ff0000' });
        cancelButton.setInteractive();
        cancelButton.setDepth(7);
        cancelButton.on('pointerdown', () => {
          this.cancelHiringProcess(promptText, cancelButton);
          this.removeOverLay(overLay);
        });

        // TODO
        // Make the map interactive for selection
        this.makeMapInteractiveForCharacterLocation(slotY, panelY, index, cancelButton, promptText, overLay);

      } else {
        let insufficientFundsImage = this.add.image(panelY, slotY, 'noCash');
        insufficientFundsImage.setDisplaySize(this.menuWidth - 3, this.characterImageHeight); // Adjust the size as needed
        insufficientFundsImage.setAlpha(0.6)
        // Timer to remove the image after 3 seconds
        this.time.delayedCall(3000, () => {
          insufficientFundsImage.destroy();
        });
      }

    } else {
      this.clearAddOrDeleteCharacteIcons();
    }
  },

  clearAddOrDeleteCharacteIcons: function () {
    if (this.deleteIcon) {
      this.deleteIcon.destroy();
      this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering = null;
      this.deleteIcon = null;
    }

    if (this.addIcon) {
      this.addIcon.destroy();
      this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingHiring = null;
    }

    if (this.incommingIcon) {
      this.incommingIcon.destroy();
    }
  },

  deleteCharacter: function (index) {
    if (index !== this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering) {
      this.clearAddOrDeleteCharacteIcons();
      const slotY = this.startYforChars + 50 + index * 120;
      const panelY = 0 + 125;

      // Add a transparent overlay or a deletion icon on the character's image
      this.deleteIcon = this.add.image(panelY, slotY, 'deleteIndicator').setDisplaySize(this.menuWidth - 3, this.characterImageHeight);
      this.deleteIcon.setAlpha(0.3); // Make it semi-transparent
      // character.deleteIcon = deleteIcon; // Store the reference for future use
      this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering = index;
    } else {
      this.clearAddOrDeleteCharacteIcons();
    }
  },

  endTurn: function () {
    if (this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingFiering !== null) {
      this.deleteCharacterAndAddNewUniqeRandomCharacter();
    } else if (this.gameInfo.players[this.gameInfo.activePlayerIndex].pendingHiring !== null) {
      this.addCharacterAndAddNewUniqeRandomCharacter();
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
