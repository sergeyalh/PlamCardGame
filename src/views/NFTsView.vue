<template>
    <div>
        <h2>Your NFTs:</h2>
        <div v-if="nfts && nfts.length > 0">
            <div v-for="nft in nfts" :key="nft.tokenId">
                <img :src="nft.image_url" alt="NFT Image" width="100" />
                <p>{{ nft.description }}</p>
            </div>
        </div>
        <div v-else>
            <p>No NFTs found for this account.</p>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'NFTsView',
    props: {
        account: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            nfts: []
        };
    },
    methods: {
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
    },
    created() {
        this.fetchNFTs(this.account);
    }
};
</script>
  