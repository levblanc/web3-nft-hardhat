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

        it('Updates reqeust ID to sender mapping', async () => {
          const txResponse = await randomNFT.requestNFT({ value: mintFee });
          // console.log('>>>>>> requestId', requestId);
          const txReceipt = await txResponse.wait(1);
          const { requestId } = txReceipt.events[1].args;

          const owner = await randomNFT.getOwner(requestId);
          assert.equal(owner, deployer);
        });

        it('Emits an event after request NFT', async () => {
          await expect(randomNFT.requestNFT({ value: mintFee })).to.emit(
            randomNFT,
            'NFTRequested'
          );
        });
      });

      describe('fulfillRandomWords', () => {
        it('Picks a random breed, mint NFT, update token counter and set token URI', async () => {
          await new Promise(async (resolve, reject) => {
            let dogBreed = null;
            const tokenCounterStart = randomNFT.getTokenCounter();

            try {
              // request NFT
              const tx = await randomNFT.requestNFT({ value: mintFee });
              const txReceipt = await tx.wait(1);

              // fulfill random words
              const fulfillResponse =
                await vrfCoordinatorV2Mock.fulfillRandomWords(
                  txReceipt.events[1].args.requestId,
                  randomNFT.address
                );

              const fulfillReceipt = await fulfillResponse.wait(1);
              dogBreed = await randomNFT.getDogBreed();

              expect(dogBreed).not.to.be.null;
            } catch (error) {
              reject(error);
            }

            randomNFT.once('NFTMinted', async () => {
              try {
                // update token counter
                const tokenCounterEnd = randomNFT.getTokenCounter();
                assert(tokenCounterEnd, tokenCounterStart + 1);

                // set token URI
                const tokenURI = await randomNFT.getDogTokenURI(
                  dogBreed.toNumber()
                );
                assert.equal(tokenURI.toString().includes('ipfs://'), true);

                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        });
      });
    });
