<template>
  <div class="app-container">
    <header class="header">
      <h1>Welcome to PalmCards</h1>
      <div class="login-container">
        <button v-if="!account" @click="connectMetaMask">Login with MetaMask</button>
        <div v-if="account" class="account-info">
          Logged in as: {{ account }}
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="!account">Please log in to view your NFTs.</div>
      <div v-else>
        <h2>Your NFTs:</h2>
        <div v-for="nft in nfts" :key="nft.tokenId">
          <img :src="nft.image_url" alt="NFT Image" width="100" />
          <p>{{ nft.description }}</p>
        </div>
      </div>
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
    },

    async fetchNFTs(account) {
      const apiKey = '78ba06e149a14d068eb9632b84393f8d'; // Replace with your actual API key
      const apiUrl = `https://api.opensea.io/api/v2/chain/matic/account/${account}/nfts`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'X-API-KEY': apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.nfts = data.nfts; // Assuming the response contains an 'assets' array
      } catch (error) {
        console.error("Error fetching NFTs from OpenSea", error);
      }
    }
  }
};
</script>
