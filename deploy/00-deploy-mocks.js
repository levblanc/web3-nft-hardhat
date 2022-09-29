const { network, ethere } = require('hardhat');
const {
  developmentChains,
  BASE_FEE,
  GAS_PRICE_LINK,
  DECIMALS,
  INITIAL_ANSWER,
} = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const VRFCoordinatorV2MockArgs = [BASE_FEE, GAS_PRICE_LINK];
  const MockV3AggregatorArgs = [DECIMALS, INITIAL_ANSWER];
  const isLocalNetwork = developmentChains.includes(network.name);

  if (isLocalNetwork) {
    log('>>>>>> Local network detected! Deploying mocks...');

    await deploy('VRFCoordinatorV2Mock', {
      contract: '',
      from: deployer,
      log: true,
      args: VRFCoordinatorV2MockArgs,
    });

    await deploy('MockV3Aggregator', {
      contract: '',
      from: deployer,
      log: true,
      args: MockV3AggregatorArgs,
    });
  }

  log('>>>>>> Mocks deployed!');
  log('--------------------------------------------------');
};

module.exports.tags = ['all', 'mocks'];
