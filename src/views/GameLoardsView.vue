<template>
  <div class="game-container">
    <div class="game-board">
      <!-- Opponent's Hand -->
      <div class="opponent-hand">
        <div class="card" v-for="card in opponentHand" :key="card.id">
          <!-- Placeholder or backside of card image -->
          <img :src="card.image" alt="Card image">
        </div>
      </div>

      <!-- Battlefield -->
      <div class="battlefield">
        <div class="slots-container">
          <!-- Opponent Card Slots -->
          <div class="card-slots opponent-slots">
            <div class="card-slot" v-for="n in 10" :key="`opponent-slot-${n}`"></div>
          </div>

          <!-- Player Card Slots -->
          <div class="card-slots player-slots">
            <div class="card-slot" v-for="n in 10" :key="`player-slot-${n}`" @drop="dropCard($event, `player-slot-${n}`)"
              @dragover.prevent></div>
          </div>
        </div>

        <button class="end-turn-button" @click="endTurn">End Turn</button>
        <!-- Elements representing the battlefield go here -->
      </div>

      <!-- Player's Hand -->
      <div class="player-hand">
        <div class="card" v-for="card in playerHand" :key="card.id" draggable="true" @dragstart="dragCard($event, card)">
          <!-- Display card details -->
          <img :src="card.image" alt="Card image">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameView',
  data() {
    return {
      playerHand: Array(5).fill({ id: 0, image: 'https://qph.cf2.quoracdn.net/main-qimg-c39a0c50da1e677c062d1cae7f34d8bf-lq' }),
      opponentHand: Array(5).fill({ id: 0, image: require('@/assets/card-back.png') }),
      // ... additional game state data
    };
  },
  methods: {
    // existing methods
    endTurn() {
      if (this.playerHand.length < 10) {
        // Example of adding a new card to the player's hand
        const newCard = this.drawCard(); // Replace with your actual card drawing logic
        this.playerHand.push(newCard);
      }
    },

    drawCard() {
      // Replace this with your actual logic to draw a card
      // For demonstration, it returns a new card object
      return {
        id: this.playerHand.length + 1,
        image: 'https://qph.cf2.quoracdn.net/main-qimg-c39a0c50da1e677c062d1cae7f34d8bf-lq', // Replace with the actual image path
        // Add other card properties as needed
      };
    },
  },
  // ... game logic methods
};
</script>

<style scoped>
.game-view {
  text-align: center;
}

.game-board {
  display: grid;
}

.player-hand,
.opponent-hand {
  background-color: #f5f5f5;
}

.battlefield {
  background-color: #eaeaea;
}

.opponent-hand,
.player-hand {
  display: flex;
  justify-content: center;
}

.card {
  width: 100px;
  /* Adjust card size as needed */
  height: 140px;
  /* Set a fixed height for the cards */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  /* Removed the transition property to prevent affecting layout changes */
}

.card img {
  width: 100px;
  /* Adjust card size as needed */
  height: 140px;
  /* Set a fixed height for the cards */
  display: block;
  /* This ensures the image takes the full width of its container */
}


.player-hand .card:hover {
  /* If the translateY effect is desired, keep this; otherwise, remove it */
  transform: translateY(-10px);
  /* Slight raise effect on hover */
  transition: transform 0.3s ease;
  /* Moved transition to only affect hover state */
}

.battlefield {
  background-image: url('../assets/backgroundBattlefield.jpg');
  /* Adjust the path as necessary */
  background-size: 100% 100%;
  background-position: center;
  /* Centers the background image */
  background-repeat: no-repeat;
  /* Prevents the image from repeating */
  min-height: 400px;
  /* Or set a height that fits your layout */
  width: 100%;
  /* Ensure the div takes full width */
  /* Add additional styling as needed */

  display: flex;
  justify-content: space-between;
  /* This will push the button to the right side */
  align-items: center;
  /* This will vertically center the button if the battlefield has a set height */
}

.end-turn-button {
  padding: 10px 20px;
  margin-right: 20px;
  /* Adjust as needed for your layout */
  cursor: pointer;
  /* Add more styles to make the button look nice */
}

.card-slots {
  display: flex;
  justify-content: center;
  
  /* Space between player and opponent slots */
}



.player-slots .card-slot {
  border-color: blue;
  border-width: 4px;
  /* Different color for player slots */
}

.opponent-slots .card-slot {
  margin-bottom: 160px;
  border-color: red;
  border-width: 4px;
  /* Different color for opponent slots */
}

.slots-container {
  padding-left: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.card-slot {
  width: 70px;
  height: 100px;
  border: 1px dashed #ccc;
  margin: 5px;
  /* Other styles... */
}
</style>
