const Dimensions = {
    // Game info
    GAME_WIDTH: 1470,
    GAME_HEIGHT: 980,
    // Menu info
    MENU_WIDTH: 250,
    MENU_HEIGHT: 980, // Same as the game height
    // Chracters to hire infoxw
    CHARACTERS_TO_HIRE_SLOT_HEIGHT: 120,
    CHARACTERS_TO_HIRE_SLOT_BOTTOM_PANEL_HEIGHT: 20,
    CHARACTERS_TO_HIRE_SLOT_IMG_HEIGHT: 100, // CHARACTERS_TO_HIRE_SLOT_HEIGHT - CHARACTERS_TO_HIRE_SLOT_BOTTOM_PANEL_HEIGHT
    CHARACTERS_TO_HIRE_TOP_Y_LOCATION: 620,// GAME_HEIGHT - (CHARACTERS_TO_HIRE_SLOT_HEIGHT * 3)
    // Top Players panel info
    PLAYERS_SLOT_HEIGHT: 70,
    PLAYERS_SLOT_IMG_WIDTH: 180,
    PLAYERS_BUFFER_LEFT_MENU: 250,
    // Battleground info
    BG_CELL_SIZE: 150,
    BG_NUM_OF_COLUMNS : 8,
    BG_NUM_OF_ROWS: 6,
    BG_LEFT_X_LOCATION : 260
};

const Players = [
    { nickname: "Jacob", 
      cash: 100, 
      nextIncome: 0, 
      activeCharacters: {}, 
      availableCharacters: [], 
      underControlPieces: [], 
      pendingFiering: null, 
      pendingHiring: null,
      news: [] },
    { nickname: "Serg", 
      cash: 100, 
      nextIncome: 0, 
      activeCharacters: {}, 
      availableCharacters: [], 
      underControlPieces: [], 
      pendingFiering: null, 
      pendingHiring: null,
      news: [] },
    { nickname: "Izov", 
      cash: 100, 
      nextIncome: 0, 
      activeCharacters: {}, 
      availableCharacters: [], 
      underControlPieces: [], 
      pendingFiering: null, 
      pendingHiring: null,
      news: [] },
    { nickname: "Elad", 
      cash: 100, 
      nextIncome: 0, 
      activeCharacters: {}, 
      availableCharacters: [], 
      underControlPieces: [], 
      pendingFiering: null, 
      pendingHiring: null,
      news: [] }
  ];



export const Config = {
    Dimensions,
    Players
  };