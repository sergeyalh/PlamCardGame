<template>
  <div class="app-container">
    <header class="header">
      <h1>Welcome to PalmCards</h1>

      <nav class="navigation-menu">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li v-if="account"><router-link to="/nfts">View NFTs</router-link></li>
          <li v-if="account"><router-link to="/game">Play Cards</router-link></li>
          <li v-if="account"><router-link to="/gameLoards">Play Conquer The World</router-link></li>
          <!-- Add more router-links as needed -->
        </ul>
      </nav>

      <div class="login-container">
        <button v-if="!account" @click="connectMetaMask">Login with MetaMask</button>
        <div v-if="account" class="account-info">
          Logged in as: {{ account }}
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view :account="account"></router-view>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2023 Your Game's Name. All rights reserved.</p>
      <p>Follow us on [Social Media Links]</p>
    </footer>
  </div>
</template>

<script>
import '../styles/landpage.css';

export default {
  data() {
    return {
      account: null,
      nfts: [],
      // Add more data properties as needed
    };
  },
  methods: {
    async connectMetaMask() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          this.account = accounts[0];
          this.fetchNFTs(this.account);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
      }
    }
  }
};
</script>
