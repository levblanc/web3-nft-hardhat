const { network, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../helper-hardhat-config');
const storeImagesAndMetadata = require('../utils/uploadToPinata');
const { verify } = require('../utils/verify');

const VRF_SUB_FUND_AMOUNT = '1000000000000000000000';
const imgFilePath = '../images/randomNFT';

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  // let tokenURIs = [];

  // Uploaded images and metadata to Pinata IPFS
  // Use the records here and not duplicate uploading again
  const tokenURIs = [
    'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
    'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
    'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm',
  ];

  // Get the IPFS hashes of images
  if (process.env.UPLOAD_TO_PINATA === 'true') {
    tokenURIs = await storeImagesAndMetadata(imgFilePath);
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

  const { gasLane, callbackGasLimit, mintFee } = networkConfig[chainId];

  const args = [
    vrfCoordinatorV2Address,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    tokenURIs,
    mintFee,
  ];

  const randomNFT = await deploy('RandomNFT', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(randomNFT.address, args);
  }

  log('--------------------------------------------------');
};

module.exports.tags = ['all', 'randomNFT', 'contract'];
