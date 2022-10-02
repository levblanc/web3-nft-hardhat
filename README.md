# web3-nft-hardhat

## Deploy contracts & mint NFT

```zsh
# Deploy at localhost
yarn run deploy

# Spin up local node
yarn run localhost

# Mint locally (spin up local node before minting)
yarn run mint:local

# Deploy to testnet (now set to goerli)
yarn run deploy:goerli

# Mint on testnet
yarn run mint:goerli
```

## Testing

```zsh
# Run tests
yarn run test

# Run tests and show coverage report
yarn run coverage
```

## Code Linting & Formating

```zsh
# Lint contract files
yarn run lint

# Lint & Fix contract files
yarn run lint:fix

# Format codes with Prettier
yarn run format
```

## Goerli Address to play with
```zsh
deploying "BasicNFT" (tx: 0xe1debb4c4ad4590c64ba35a2e35342a0d22ce64935d47e2d78f0e8f0bcb1c1ae)...: deployed at 0x2a9746d1b4b1b3B745ec65045c8F4B04c91eAc4F with 2017613 gas
Verifying...
>>>>>> Verifying contract ...
Successfully submitted source code for contract
contracts/BasicNFT.sol:BasicNFT at 0x2a9746d1b4b1b3B745ec65045c8F4B04c91eAc4F
for verification on the block explorer. Waiting for verification result...

Successfully verified contract BasicNFT on Etherscan.
https://goerli.etherscan.io/address/0x2a9746d1b4b1b3B745ec65045c8F4B04c91eAc4F#code
-----------------------------------------
deploying "RandomNFT" (tx: 0x4a7afba3196b54ae3c63504ed8e408df0ce8b09d521880ceb1c6bdc46d96b647)...: deployed at 0xf04F7BF40FC3e8543B4826cB0a8285B518788400 with 3604295 gas
>>>>>> Verifying contract ...
Successfully submitted source code for contract
contracts/RandomNFT.sol:RandomNFT at 0xf04F7BF40FC3e8543B4826cB0a8285B518788400
for verification on the block explorer. Waiting for verification result...

Successfully verified contract RandomNFT on Etherscan.
https://goerli.etherscan.io/address/0xf04F7BF40FC3e8543B4826cB0a8285B518788400#code
--------------------------------------------------
deploying "DynamicSvgNFT" (tx: 0x995d78a70b4a9f087a4350e50d75b04aa0f1d6e02fd892515a646d3df174f66f)...: deployed at 0x7ec8879756309b9EeeeA14b40FcE878775158557 with 4381072 gas
>>>>>> Verifying contract ...
Nothing to compile
Successfully submitted source code for contract
contracts/DynamicSvgNFT.sol:DynamicSvgNFT at 0x7ec8879756309b9EeeeA14b40FcE878775158557
for verification on the block explorer. Waiting for verification result...

Successfully verified contract DynamicSvgNFT on Etherscan.
https://goerli.etherscan.io/address/0x7ec8879756309b9EeeeA14b40FcE878775158557#code
```