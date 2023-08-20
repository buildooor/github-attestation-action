import { EAS, SchemaEncoder, SchemaRegistry } from '@ethereum-attestation-service/eas-sdk'
import { ethers } from 'ethers'

const addresses: any = {
  'mainnet': {
    schemaRegistryContractAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
    EASContractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
    schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
  },
  'sepolia': {
    schemaRegistryContractAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0', // Sepolia 0.26
    EASContractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e', // Sepolia v0.26
    schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
  },
  'optimism-goerli': {
    schemaRegistryContractAddress: '0x7b24c7f8af365b4e308b6acb0a7dfc85d034cb3f',
    EASContractAddress: '0x1a5650d0ecbca349dd84bafa85790e3e6955eb84',
    schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
  },
  'optimism': {
    schemaRegistryContractAddress: '0x4200000000000000000000000000000000000020',
    EASContractAddress: '0x4200000000000000000000000000000000000021',
    schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
  }
}

type CreateSchemaInput = {
  privateKey: string
  network: string
  rpcUrl: string
}

type AttestInput = {
  privateKey: string
  network: string
  rpcUrl: string
  repo: string
  branch: string
  username: string
  pullRequest: number
}

export async function createSchema(input: CreateSchemaInput) {
  const { privateKey, network, rpcUrl } = input

  if (!privateKey) {
    throw new Error('privateKey is required')
  }

  if (!network) {
    throw new Error('network is required')
  }

  if (!rpcUrl) {
    throw new Error('rpcUrl is required')
  }

  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl)

  const signer = new ethers.Wallet(privateKey, provider)
  const schemaRegistryContractAddress = addresses[network].schemaRegistryContractAddress
  if (!schemaRegistryContractAddress) {
    throw new Error(`schemaRegistryContractAddress is not available for network "${network}"`)
  }
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress)
  schemaRegistry.connect(signer)

  const schema = 'string repository,string branch,string username,uint256 pullRequest'
  const resolverAddress = '0x0000000000000000000000000000000000000000'
  const revocable = true

  const tx = await schemaRegistry.register({
    schema,
    resolverAddress,
    revocable,
  })

  console.log('tx:', tx)
  await tx.wait()
  console.log('schema creation done')

  return tx
}

export async function attest(input : AttestInput) {
  const { privateKey, network, rpcUrl, repo, branch, username, pullRequest } = input

  if (!privateKey) {
    throw new Error('privateKey is required')
  }

  if (!network) {
    throw new Error('network is required')
  }

  if (!rpcUrl) {
    throw new Error('rpcUrl is required')
  }

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

  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl)

  const signer = new ethers.Wallet(privateKey, provider)
  const EASContractAddress = addresses[network].EASContractAddress
  if (!EASContractAddress) {
    throw new Error(`EASContractAddress is not available for network "${network}"`)
  }
  const eas = new EAS(EASContractAddress)
  eas.connect(signer)

  const schemaUID = addresses[network].schemaUID
  if (!schemaUID) {
    throw new Error(`schemaUID is not available for network "${network}"`)
  }

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder('string repository, string branch, string username, uint256 pullRequest')
  const encodedData = schemaEncoder.encodeData([
    { name: 'repository', value: repo, type: 'string' },
    { name: 'branch', value: branch, type: 'string' },
    { name: 'username', value: username, type: 'string' },
    { name: 'pullRequest', value: pullRequest, type: 'uint256' },
  ])

  const res = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: '0x0000000000000000000000000000000000000000',
      expirationTime: 0,
      revocable: true,
      data: encodedData,
    },
  })

  const hash = res.tx.hash
  const newAttestationUID = await res.wait()

  return {
    hash,
    uid: newAttestationUID
  }
}

if (require.main === module) {
  require('dotenv').config()
  async function main() {
    const privateKey = process.env.PRIVATE_KEY
    const network = process.env.NETWORK
    const rpcUrl = process.env.RPC_URL

    if (privateKey && network && rpcUrl) {
      await createSchema({
        privateKey,
        network,
        rpcUrl,
      } as any)

      const result = await attest({
        privateKey,
        network,
        rpcUrl,
        repo: 'example',
        branch: 'main',
        username: 'example',
        pullRequest: 1
      } as any)
      console.log('result:', result)
    }
  }

  main().catch(console.error)
}
