"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attest = exports.createSchema = void 0;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const ethers_1 = require("ethers");
const addresses = {
    sepolia: {
        schemaRegistryContractAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
        EASContractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
        schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
    }
};
function createSchema(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, network, rpcUrl } = input;
        if (!privateKey) {
            throw new Error('privateKey is required');
        }
        if (!network) {
            throw new Error('network is required');
        }
        if (!rpcUrl) {
            throw new Error('rpcUrl is required');
        }
        const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(privateKey, provider);
        const schemaRegistryContractAddress = addresses[network].schemaRegistryContractAddress;
        const schemaRegistry = new eas_sdk_1.SchemaRegistry(schemaRegistryContractAddress);
        schemaRegistry.connect(signer);
        const schema = 'string repository,string branch,string username,uint256 pullRequest';
        const resolverAddress = '0x0000000000000000000000000000000000000000';
        const revocable = true;
        const tx = yield schemaRegistry.register({
            schema,
            resolverAddress,
            revocable,
        });
        console.log('tx:', tx);
        yield tx.wait();
        console.log('schema creation done');
    });
}
exports.createSchema = createSchema;
function attest(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, network, rpcUrl, repo, branch, username, pullRequest } = input;
        if (!privateKey) {
            throw new Error('privateKey is required');
        }
        if (!network) {
            throw new Error('network is required');
        }
        if (!rpcUrl) {
            throw new Error('rpcUrl is required');
        }
        if (!repo) {
            throw new Error('repo is required');
        }
        if (!branch) {
            throw new Error('branch is required');
        }
        if (!username) {
            throw new Error('username is required');
        }
        if (!pullRequest) {
            throw new Error('pullRequest is required');
        }
        const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(privateKey, provider);
        const EASContractAddress = addresses[network].EASContractAddress;
        const eas = new eas_sdk_1.EAS(EASContractAddress);
        eas.connect(signer);
        const schemaUID = addresses[network].schemaUID;
        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new eas_sdk_1.SchemaEncoder('string repository, string branch, string username, uint256 pullRequest');
        const encodedData = schemaEncoder.encodeData([
            { name: 'repository', value: repo, type: 'string' },
            { name: 'branch', value: branch, type: 'string' },
            { name: 'username', value: username, type: 'string' },
            { name: 'pullRequest', value: pullRequest, type: 'uint256' },
        ]);
        const tx = yield eas.attest({
            schema: schemaUID,
            data: {
                recipient: '0x0000000000000000000000000000000000000000',
                expirationTime: 0,
                revocable: true,
                data: encodedData,
            },
        });
        const hash = tx;
        const newAttestationUID = yield tx.wait();
        return {
            hash,
            uid: newAttestationUID
        };
    });
}
exports.attest = attest;
