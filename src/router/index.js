import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; // Your Home component
import NFTsView from '../views/NFTsView.vue'; // Component to display NFTs
import GameView from '../views/GameView.vue'; // Component to launch game
import GameLoardsView from '../views/GameLoardsView.vue'; // Component to launch game

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/nfts',
    name: 'NFTs',
    component: NFTsView
  },
  {
    path: '/game',
    name: 'Play',
    component: GameView
  },
  {
    path: '/gameLoards',
    name: 'PlayLoards',
    component: GameLoardsView
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
