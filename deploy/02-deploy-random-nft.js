const { network, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../helper-hardhat-config');
const storeImages = require('../utils/uploadToPinata');
const { verify } = require('../utils/verify');

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther('30');
const imgFilePath = '../images/randomNFT';

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  // Get the IPFS hashes of images
  if (process.env.UPLOAD_TO_PINATO === 'true') {
    await handleTokenURIs();
  }

  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock'
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

    const txResponse = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await txResponse.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;

    // Fund the subscription
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  await storeImages(imgFilePath);

  // const { gasLane, callbackGasLimit, mintFee } = networkConfig[chainId];

  // const args = [
  //   vrfCoordinatorV2,
  //   gasLane,
  //   subscriptionId,
  //   callbackGasLimit,
  //   dogTokenURIs,
  //   mintFee,
  // ];

  // const randomNFT = await deploy('RandomNFT', {
  //   from: deployer,
  //   args,
  //   log: true,
  //   waitConfirmations: network.config.blockConfirmations || 1,
  // });

  // log('--------------------------------------------------');

  // if (
  //   !developmentChains.includes(network.name) &&
  //   process.env.ETHERSCAN_API_KEY
  // ) {
  //   await verify(randomNFT.address, args);
  // }

  // log('--------------------------------------------------');
};

async function handleTokenURIs() {
  let tokenURIs = [];

  // Store the image in IPFS

  // Store the metadata in IPFS

  return tokenURIs;
}

module.exports.tags = ['all', 'randomNFT'];
