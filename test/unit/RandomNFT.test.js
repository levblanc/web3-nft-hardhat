const { expect, assert } = require('chai');
const { getNameAccounts, deployments, ethers, network } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('RandomNFT Unit Tests', () => {
      let deployer, randomNFT, vrfCoordinatorV2Mock, mintFee;
      const { chainId } = network.config;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['mocks', 'randomNFT']);

        randomNFT = await ethers.getContract('RandomNFT', deployer);
        mintFee = await randomNFT.getMintFee();

        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer
        );
      });

      describe('requestNFT', () => {
        it('Reverts when mint fee is not enough', async () => {
          await expect(randomNFT.requestNFT()).to.be.revertedWithCustomError(
            randomNFT,
            'RandomNFT__MintFeeNotEnough'
          );
        });

        it('Returns requestId after success', async () => {
          const { requestId } = await randomNFT.requestNFT({ value: mintFee });

          expect(requestId).to.be.not.null;
        });

        it('Updates sender mapping', async () => {
          const requestId = await randomNFT.requestNFT({ value: mintFee });
          console.log('>>>>>> requestId', requestId);
          // const owner = await randomNFT.getOwner(requestId);
          // console.log('owner', owner);

          // assert.equal(owner, deployer);
        });

        it('Emits an event after request NFT', async () => {
          await expect(randomNFT.requestNFT({ value: mintFee })).to.emit(
            randomNFT,
            'NFTRequested'
          );
        });
      });
    });
