const { EAS, Offchain, SchemaEncoder, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk")
const { ethers } = require("ethers")
require("dotenv").config()

async function createSchema() {
  const provider = new ethers.providers.StaticJsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/B2UYqx9UmXKqTFcd5R1p1dz6lWFTeuUa')
  const privateKey = process.env.PRIVATE_KEY

  // Signer is an ethers.js Signer instance
  const signer = new ethers.Wallet(privateKey, provider);

  const schemaRegistryContractAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(signer);

  const schema = "string repository,string branch,string username,uint256 pullRequest"
  // const resolverAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26
  const resolverAddress = "0x0000000000000000000000000000000000000000"; // Sepolia 0.26
  const revocable = true;

  const tx = await schemaRegistry.register({
    schema,
    resolverAddress,
    revocable,
  });

  console.log(tx.hash)
  await tx.wait()
  console.log('schema done')
}

async function onchain(data: any) {
  const rpcUrl = data.rpcUrl
  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl)
  const privateKey = data.privateKey

  // Signer is an ethers.js Signer instance
  const signer = new ethers.Wallet(privateKey, provider);

  const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

  const eas = new EAS(EASContractAddress);
  eas.connect(signer);
  const repo = data.repo
  const branch = data.branch
  const username = data.username
  const pullRequest = data.pullRequest

  if (!repo) {
    throw new Error('repo is required')
  }

  if (!branch) {
    throw new Error('branch is required')
  }

  if (!username) {
    throw new Error('username is required')
  }

  if (!pullRequest) {
    throw new Error('pullRequest is required')
  }

  const schemaUID = '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'

// const schemaRegistryContractAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26
// const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
// schemaRegistry.connect(provider);
// const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });

// console.log(schemaRecord);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("string repository, string branch, string username, uint256 pullRequest");
  const encodedData = schemaEncoder.encodeData([
    { name: "repository", value: repo, type: "string" },
    { name: "branch", value: branch, type: "string" },
    { name: "username", value: username, type: "string" },
    { name: "pullRequest", value: pullRequest, type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: 0,
      revocable: true,
      data: encodedData,
    },
  });


  const newAttestationUID = await tx.wait();

  console.log("New attestation UID:", newAttestationUID);
}

export { onchain }

//async function main() {
  // await createSchema()
  // await offchain()
  // await onchain()
//}

// main().catch(console.error)
