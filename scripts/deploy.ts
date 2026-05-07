import { ethers, network } from 'hardhat';

async function main() {
  const networkName =
    network.name === 'base'
      ? 'Base mainnet'
      : network.name === 'baseSepolia'
        ? 'Base Sepolia'
        : network.name;
  const explorerBase =
    network.name === 'base'
      ? 'https://basescan.org'
      : 'https://sepolia.basescan.org';

  console.log(`🚀 Deploying CosmicLeaderboard to ${networkName}...`);

  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log(
    'Balance:',
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    'ETH',
  );

  const CosmicLeaderboard =
    await ethers.getContractFactory('CosmicLeaderboard');
  const contract = await CosmicLeaderboard.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ CosmicLeaderboard deployed to:', address);
  console.log('🔍 View on Basescan:', `${explorerBase}/address/${address}`);
  console.log('\n📝 Add this to your frontend .env.local:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
