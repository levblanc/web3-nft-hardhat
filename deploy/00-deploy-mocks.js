const { network, ethere } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

const BASE_FEE = ethers.utils.parseEther('0.25');
// LINK per gas. Calculated value based on the gas price of the chain
const GASE_PRICE_LINK = 1e9; // 1000000000

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GASE_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log('>>>>>> Local network detected! Deploying mocks...');

    await deploy('VRFCoordinatorV2Mock', {
      contract: '',
      from: deployer,
      log: true,
      args,
    });
  }

  log('>>>>>> Mocks deployed!');
  log('--------------------------------------------------');
};

module.exports.tags = ['all', 'mocks'];
