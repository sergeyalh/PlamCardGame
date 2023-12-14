import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; // Your Home component
import NFTsView from '../views/NFTsView.vue'; // Component to display NFTs

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
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
