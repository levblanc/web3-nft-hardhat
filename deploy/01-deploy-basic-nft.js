const { network } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('-----------------------------------------');
  const args = [];
  const waitConfirmations = network.config.blockConfirmations || 1;

  const basicNFT = await deploy('BasicNFT', {
    from: deployer,
    args,
    log: true,
    waitConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...');
    await verify(basicNFT.address, args);
  }

  log('-----------------------------------------');
};
