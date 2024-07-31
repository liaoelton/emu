# EmuScan - Small explorer for Solana

<div align="center">
    <img src="./frontend/public/emu.png" alt="EmuScan Logo" width="200" style="border-radius: 50%;" />
</div>

## Completed Features

### Frontent

-   List Blocks
-   List Transactions from a block
-   Show Transaction details (including instructions / accounts / log)
-   Can search by Block hash / Tx hash
-   Can sort by timestamp
-   Docker compose
-   Set up configuration options using environment variables
-   Deployed on Vercel (https://emu-puce.vercel.app/)

### Backend

-   Support all front-end features
-   RESTful API
-   Containerize
-   Testing
-   Docker compose
-   Rate limiting
-   Set up configuration options using environment variables
-   Deployed on Vercel (https://emu-ugq2.vercel.app/)
    -   Note: The `/blocks` endpoints might return a 504 error if the request takes longer than 10 seconds due to Vercel's free plan timeout. (Todo: Deploy on GCP Cloud Run, but currently facing issues with its payment system)
    -   Note: The db supports the blockHashes search from slot `280766471` to `280763534`.
## Architecture

### Backend (Express.js)

-   API Endpoints: Implemented RESTful API endpoints for fetching block and transaction data, as well as performing searches based on slot, signature, or block hash.
    -   `/blocks?end=`: Fetches 5 blocks before `end` slot from the Solana blockchain.
    -   `/blocks/:slot`: Fetches block data for a specific `slot`.
    -   `/txs?slot=&page=&limit=`: Fetches transactions for a specific `slot` with pagination.
    -   `/txs/:signature`: Fetches transaction data for a specific `signature`.
    -   `/slot`: Fetches the current slot number from the Solana blockchain.
    -   `/search/:query`: Performs a search based on the provided query, query could be `slot number`, `tx signature`, or `block hash` and returns the results.
-   Database Integration: Utilizes MongoDB for storing already queried block and transaction data, which is used to reduce the calls to the Solana RPC API.
-   Error Handling: Use error handling middleware for managing API errors gracefully.
-   Health Check: An endpoint for checking the health status of the backend service.
-   Containerization: Containerized using Docker.
-   Packages:
    -   `@solana/web3.js`: Library to wrap Alchemy's Solana RPC API to interact with the Solana.
    -   `mongoose`: MongoDB ODM for Node.js.
    -   `dotenv`: To load environment variables from a .env file.
    -   `cors`: To enable Cross-Origin Resource Sharing (CORS) for the API.
    -   `jest`: For testing the API endpoints.
    -   `axios`: For making HTTP requests.
    -   `express-rate-limit`: To rate limit API requests.

### Frontend (Next.js)

-   Pages:
    -   `/`: Show current slot info a list of recent blocks (with a load more button to fetch more blocks).
    -   `/block/:slot`: Show block info for a specific slot and its transactions with pagination.
    -   `/tx/:signature`: Show transaction info for a specific signature and its accounts, instructions, and logs.
-   Containerization: Containerized using Docker.
-   Packages:
    -   `mantine`: UI library for React.
    -   `@solanafm/explorer-kit`: Library for parsing tx instructions and data.
    -   `@solanafm/explorer-kit-idls`: Library for parsing IDLs.
    -   `react-json-view`: For displaying JSON data in a more readable format.
    -   `axios`: For making HTTP requests.

### Indexer

-   Index through Alchemy's Solana RPC API and store the block slot-blockHash mapping in MongoDB.

## Usage

### Environment Variables

```bash
# Frontend
NEXT_PUBLIC_BACKEND_URL=<BACKEND_URL>
# Backend
MONGO_URL=<MONGO_URL>
ALCHEMY_API_KEY=<ALCHEMY_API_KEY>
# Indexer
MONGO_URL=<MONGO_URL>
ALCHEMY_API_KEY=<ALCHEMY_API_KEY>
```

### Installation

```bash
make install
```

### Launch Frontend and Backend development servers

```bash
make dev-up
```

### Launch Indexer

```bash
make indexer
```

### Launch Frontend and Backend production builds

```bash
make prod-up
```
