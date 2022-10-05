const { assert, expect } = require('chai');
const { getNamedAccounts, deployments, ethers, network } = require('hardhat');
const {
  deploymentChains,
  networkConfig,
  developmentChains,
} = require('../../helper-hardhat-config');
const {
  lowSvgImgURI,
  highSvgImgURI,
  lowImgTokenURI,
  highImgTokenURI,
  tokenURI,
} = require('../constants');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('DynamicSvgNFT Unit Tests', () => {
      let deployer, dynamicSvgNFT, mockV3Aggregator;
      const { chainId } = network.config;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['mocks', 'dynamicSvgNFT']);

        dynamicSvgNFT = await ethers.getContract('DynamicSvgNFT', deployer);
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer
        );
      });

      describe('constructor', () => {
        it('Initiates variables correctly', async () => {
          const tokenCounter = await dynamicSvgNFT.getTokenCounter();
          assert(tokenCounter, 0);

          const lowImgURI = await dynamicSvgNFT.getLowImgURI();
          assert(lowImgURI, lowSvgImgURI);

          const highImgURI = await dynamicSvgNFT.getHighImgURI();
          assert(highImgURI, highSvgImgURI);

          const priceFeed = await dynamicSvgNFT.getPriceFeed();
          assert(priceFeed, mockV3Aggregator.address);
        });
      });

      describe('tokenURI', () => {
        it('Reverts if token Id not exist', async () => {
          await expect(dynamicSvgNFT.tokenURI(3)).to.be.revertedWithCustomError(
            dynamicSvgNFT,
            'DynamicSvgNFT__TokenNotExsit'
          );
        });

        it('Returns token URI correctly', async () => {
          const highValue = await ethers.utils.parseEther('0.01');
          const tokenCounter = await dynamicSvgNFT.getTokenCounter();

          const mintTx = await dynamicSvgNFT.mintNFT(highValue);
          const mintReceipt = await mintTx.wait(1);

          const uri = await dynamicSvgNFT.tokenURI(tokenCounter);
          assert(uri, tokenURI);
        });
      });

      describe('mintNFT', () => {
        it('Mints NFT, updates token Id to high value mapping and updates token counter', async () => {
          await new Promise(async (resolve, reject) => {
            const tokenCounterStart = await dynamicSvgNFT.getTokenCounter();
            const highValue = await ethers.utils.parseEther('0.01');

            try {
              const mintTx = await dynamicSvgNFT.mintNFT(highValue);
              const mintReceipt = await mintTx.wait(1);

              resolve();
            } catch (error) {
              reject(error);
            }

            dynamicSvgNFT.once('CreatedNFT', async () => {
              // update token counter
              const tokenCounterEnd = await dynamicSvgNFT.getTokenCounter();
              assert.equal(
                tokenCounterEnd.toNumber(),
                tokenCounterStart.toNumber() + 1
              );

              // updates token Id to high value mapping
              const highValueResult = await dynamicSvgNFT.getTokenIdToHighValue(
                tokenCounterStart
              );
              assert.equal(highValueResult, highValue);
            });
          });
        });
      });
    });
