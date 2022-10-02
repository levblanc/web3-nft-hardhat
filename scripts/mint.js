const { getNamedAccounts, network, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

const mintNFT = async () => {
  const isLocalNetwork = developmentChains.includes(network.name);
  const { deployer } = await getNamedAccounts();

  // Basic NFT
  console.log('>>>>>> Minting Basic NFT ...');

  const basicNFT = await ethers.getContract('BasicNFT', deployer);
  const basicTx = await basicNFT.mintNFT();
  await basicTx.wait(1);
  const basicNFTTokenURI = await basicNFT.TOKEN_URI();

  console.log('>>>>>> Baisc NFT minted! Token URI is:');
  console.log(`>>>>>> ${basicNFTTokenURI}`);
  console.log('---------------------------------------');

  // Dynamic SVG NFT
  console.log('>>>>>> Minting Dynamic SVG NFT ...');

  const dynamicSvgNFT = await ethers.getContract('DynamicSvgNFT', deployer);
  const highValue = ethers.utils.parseEther('0.5');
  const dynamicNFTTokenId = await dynamicSvgNFT.getTokenCounter();

  const dynamicTx = await dynamicSvgNFT.mintNFT(highValue);
  await dynamicTx.wait(1);
  const dynamicNFTTokenURI = await dynamicSvgNFT.tokenURI(dynamicNFTTokenId);

  console.log('>>>>>> Dynamic SVG NFT minted! Token URI is:');
  console.log(`>>>>>> ${dynamicNFTTokenURI}`);
  console.log('---------------------------------------');

  // Random IPFS NFT
  console.log('>>>>>> Minting Random IPFS NFT ...');

  const randomNFT = await ethers.getContract('RandomNFT', deployer);
  const randomNFTMintFee = await randomNFT.getMintFee();

  const requestRandomNFT = await randomNFT.requestNFT({
    value: randomNFTMintFee,
  });
  const randomNFTReceipt = await requestRandomNFT.wait(1);

  await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject('>>>>>> NFTRequested event timeout!');
    }, 900000); // 15 mins timeout time

    if (isLocalNetwork) {
      const { requestId } = await randomNFTReceipt.events[1].args;
      const vrfCoordinatorV2Mock = await ethers.getContract(
        'VRFCoordinatorV2Mock',
        deployer
      );

      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomNFT.address
      );
    }

    randomNFT.once('NFTRequested', async () => {
      const randomNFTTokenId = await randomNFT.getTokenCounter();
      const randomNFTTokenURI = await randomNFT.tokenURI(randomNFTTokenId);

      console.log('>>>>>> Random NFT minted! Token URI is:');
      console.log(`>>>>>> ${randomNFTTokenURI}`);
      console.log('---------------------------------------');

      resolve();
    });
  });
};

mintNFT()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
