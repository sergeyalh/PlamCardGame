const Dimensions = {
    GAME_WIDTH: 1470,
    GAME_HEIGHT: 980,
    MENU_WIDTH: 250,
    MENU_HEIGHT: 980, // Same as the game height
    
    CHARACTERS_TO_HIRE_SLOT_HEIGHT: 120,
    CHARACTERS_TO_HIRE_SLOT_BOTTOM_PANEL_HEIGHT: 20,
    CHARACTERS_TO_HIRE_SLOT_IMG_HEIGHT: 100 // Slot height - panel height
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