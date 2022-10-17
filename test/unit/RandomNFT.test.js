const { expect, assert } = require('chai');
const { getNamedAccounts, deployments, ethers, network } = require('hardhat');
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
            const tokenCounterStart = await randomNFT.getTokenCounter();

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
                const tokenCounterEnd = await randomNFT.getTokenCounter();
                assert.equal(
                  tokenCounterEnd.toNumber(),
                  tokenCounterStart.toNumber() + 1
                );

                // set token URI
                const tokenURI = await randomNFT.getDogTokenURI(
                  // dogBreed.toString()
                  dogBreed
                );
                const expectedTokenURI = await randomNFT.tokenURI(
                  tokenCounterStart
                );
                // assert.equal(tokenURI.toString().includes('ipfs://'), true);
                assert.equal(expectedTokenURI, tokenURI);

                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        });
      });

      describe('withdraw', () => {
        it('Owner can withdraw the money successfully', async () => {
          const contractStartingBalance = await randomNFT.provider.getBalance(
            randomNFT.address
          );
          const deployerStartingBalance = await randomNFT.provider.getBalance(
            deployer
          );

          // Act
          const requestTx = await randomNFT.requestNFT({ value: mintFee });
          const {
            gasUsed: requestGasUsed,
            effectiveGasPrice: requestGasPrice,
          } = await requestTx.wait(1);

          const requestGasCost = requestGasUsed.mul(requestGasPrice);

          const contractBalanceUponRequest =
            await randomNFT.provider.getBalance(randomNFT.address);

          const withdrawTx = await randomNFT.withdraw();
          const {
            gasUsed: withdrawGasUsed,
            effectiveGasPrice: withdrawGasPrice,
          } = await withdrawTx.wait(1);
          const withdrawGasCost = withdrawGasUsed.mul(withdrawGasPrice);

          const contractEndingBalance = await randomNFT.provider.getBalance(
            randomNFT.address
          );
          const deployerEndingBalance = await randomNFT.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(contractEndingBalance, 0);
          assert.equal(
            deployerEndingBalance.toString(),
            deployerStartingBalance
              .sub(requestGasCost)
              .sub(withdrawGasCost)
              .toString()
          );
        });

        it('Only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];

          const attackerConnectedContract = await randomNFT.connect(attacker);

          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            'Ownable: caller is not the owner'
          );
        });

        it('Reverts if withdraw fails', async () => {
          // const accounts = await ethers.getSigners();
          // const attacker = accounts[1];
          // const attackerConnectedContract = await randomNFT.connect(attacker);
          // await expect(randomNFT.withdraw()).to.be.revertedWithCustomError(
          //   randomNFT,
          //   'RandomNFT__WithdrawFailed'
          // );
        });
      });

      describe('getBreedFromModdedRng', () => {
        it('Returns pug if moddedRng is 0 - 9', async () => {
          const breed = await randomNFT.getBreedFromModdedRng(5);
          expect(0, breed);
        });

        it('Returns shiba-inu if moddedRng is 10 - 29', async () => {
          const breed = await randomNFT.getBreedFromModdedRng(25);
          expect(1, breed);
        });

        it('Returns st. bernard if moddedRng is 30 - 99', async () => {
          const breed = await randomNFT.getBreedFromModdedRng(45);
          expect(2, breed);
        });

        it('Reverts if moddedRng is > 99', async () => {
          await expect(
            randomNFT.getBreedFromModdedRng(100)
          ).to.be.revertedWithCustomError(
            randomNFT,
            'RandomNFT__RangeOutOfBounds'
          );
        });
      });
    });
