const { EAS, Offchain, SchemaEncoder, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk")
const { ethers } = require("ethers")
require("dotenv").config()

const provider = new ethers.providers.StaticJsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/B2UYqx9UmXKqTFcd5R1p1dz6lWFTeuUa')
const privateKey = process.env.PRIVATE_KEY

// Signer is an ethers.js Signer instance
const signer = new ethers.Wallet(privateKey, provider);

async function createSchema() {
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


async function offchain() {
  const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

  // Initialize Offchain class with EAS configuration
  const EAS_CONFIG = {
    address: EASContractAddress,
    version: 0.26,
    chainId: 11155111,
  };
  const offchain = new Offchain(EAS_CONFIG);
  const repo = 'github'
  const branch = 'master'
  const username = 'github'
  const pullRequest = 1

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("string repository, string branch, string username, uint256 pullRequest");
  const encodedData = schemaEncoder.encodeData([
    { name: "repository", value: repo, type: "string" },
    { name: "branch", value: branch, type: "string" },
    { name: "username", value: username, type: "string" },
    { name: "pullRequest", value: pullRequest, type: "uint256" },
  ]);

  const offchainAttestation = await offchain.signOffchainAttestation({
    recipient: '0x0000000000000000000000000000000000000000',
    // Unix timestamp of when attestation expires. (0 for no expiration)
    expirationTime: 0,
    // Unix timestamp of current time
    time: Math.floor(Date.now() / 1000),
    revocable: true,
    nonce: 0,
    schema: '0x429091704945813744707f5bb6d6ac35bcb7c69add2e51316c8f17847d2bb587',
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: encodedData,
  }, signer);
  console.log('attestation', offchainAttestation)
}

async function onchain() {
  const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

  const eas = new EAS(EASContractAddress);
  eas.connect(signer);
  const repo = 'github'
  const branch = 'master'
  const username = 'github'
  const pullRequest = 1

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

async function main() {
  // await createSchema()
  // await offchain()
  await onchain()
}

main().catch(console.error)
