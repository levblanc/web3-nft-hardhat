const { network, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../helper-hardhat-config');
const fs = require('fs-extra');
const path = require('path');
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  let ethUsdPriceFeedAddress;
  const isLocalNetwork = developmentChains.includes(network.name);

  if (isLocalNetwork) {
    const ethUsdAggregator = await ethers.getContract('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const svgDir = path.resolve(__dirname, '../images/dynamicSVG');
  const lowSVGPath = path.resolve(svgDir, 'frowny.svg');
  const highSVGPath = path.resolve(svgDir, 'happy.svg');

  try {
    const lowSVG = await fs.readFileSync(lowSVGPath, { encoding: 'utf-8' });
    const highSVG = await fs.readFileSync(highSVGPath, { encoding: 'utf-8' });
    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG];

    const dynamicSvgNFT = await deploy('DynamicSvgNFT', {
      from: deployer,
      args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!isLocalNetwork && process.env.ETHERSCAN_API_KEY) {
      await verify(dynamicSvgNFT.address, args);
    }

    log('----------------------------------------------------');
  } catch (error) {
    console.error(error);
  }
};

module.exports.tags = ['all', 'dynamicSvgNFT', 'contract'];
