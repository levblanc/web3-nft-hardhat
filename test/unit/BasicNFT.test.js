const { assert } = require('chai');
const { getNamedAccounts, ethers, network, deployments } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Basic NFT Unit Tests', () => {
      let deployer, basicNFT, tokenCounter;
      const TOKEN_URI =
        'ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json';
      const { chainId } = network.config;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['all']);

        basicNFT = await ethers.getContract('BasicNFT', deployer);
      });

      describe('constructor', () => {
        it('Initialaize NFT with correct name & symbol', async () => {
          const name = await basicNFT.name();
          const symbol = await basicNFT.symbol();

          assert.equal(name, 'Dogie');
          assert.equal(symbol, 'DOG');
        });

        it('Initialize token counter (token ID) correctly', async () => {
          tokenCounter = (await basicNFT.getTokenCounter()).toNumber();

          assert.equal(tokenCounter, 0);
        });
      });

      describe('tokenURI', () => {
        it('Gets token URI correctly', async () => {
          const tokenURI = await basicNFT.tokenURI(tokenCounter);

          assert.equal(tokenURI, TOKEN_URI);
        });
      });

      describe('mintNFT', () => {
        it('Increments token counter correctly', async () => {
          tokenCounter = await basicNFT.mintNFT();

          tokenCounter = (await basicNFT.getTokenCounter()).toNumber();
          assert.equal(tokenCounter, 1);
        });
      });
    });
