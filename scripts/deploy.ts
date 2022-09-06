import { ethers, network, run } from "hardhat";
import config from "../config";

const main = async () => {
  // Compile contracts
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;
  const { getSigners } = ethers;
  const deployer = (await getSigners())[0].address;

  // Sanity checks
  if (networkName === "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  } else if (networkName === "testnet") {
    if (!process.env.KEY_TESTNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  }

  if (!config.PancakeRouter[networkName] || config.PancakeRouter[networkName] === ethers.constants.AddressZero) {
    throw new Error("Missing router address, refer to README 'Deployment' section");
  }

  if (!config.WBNB[networkName] || config.WBNB[networkName] === ethers.constants.AddressZero) {
    throw new Error("Missing WBNB address, refer to README 'Deployment' section");
  }

  console.log("Deploying to network:", networkName);

  // Deploy PancakeZapV1
  console.log("Deploying swap factory..");

  const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
  const PancakeRouter = await ethers.getContractFactory("PancakeRouter");

  const pancakeFactory = await PancakeFactory.deploy(
    deployer
  );

  await pancakeFactory.deployed();

  console.log("PancakeFactory deployed to:", pancakeFactory.address);

  const pancakeRouter = await PancakeRouter.deploy(
    pancakeFactory.address,
    config.WBNB[networkName]
  );

  await pancakeRouter.deployed();

  console.log("PancakeRouter deployed to:", pancakeRouter.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
