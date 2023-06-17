"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const attest_1 = require("./attest");
const config_1 = require("./config");
function main() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Reading inputs...');
            const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true });
            const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia';
            const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true }) || config_1.defaultRpcUrls[network];
            const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || '';
            const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || [];
            const allowedBranches = (_branches === null || _branches === void 0 ? void 0 : _branches.length) ? _branches : [_branch];
            if (!privateKey) {
                throw new Error('private-key is required');
            }
            if (!network) {
                throw new Error('network is required');
            }
            if (!rpcUrl) {
                throw new Error('rpc-url is required');
            }
            if (!config_1.supportedNetworks.has(network)) {
                throw new Error(`network "${network}" is not supported`);
            }
            const pullRequest = (_c = (_b = (_a = github === null || github === void 0 ? void 0 : github.context) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.pull_request) === null || _c === void 0 ? void 0 : _c.number;
            const repo = (_f = (_e = (_d = github === null || github === void 0 ? void 0 : github.context) === null || _d === void 0 ? void 0 : _d.payload) === null || _e === void 0 ? void 0 : _e.repository) === null || _f === void 0 ? void 0 : _f.full_name;
            const branch = (_g = github === null || github === void 0 ? void 0 : github.context) === null || _g === void 0 ? void 0 : _g.ref;
            const username = (_l = (_k = (_j = (_h = github === null || github === void 0 ? void 0 : github.context) === null || _h === void 0 ? void 0 : _h.payload) === null || _j === void 0 ? void 0 : _j.pull_request) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l.login;
            if (!pullRequest) {
                console.log('pull request number is not available, skipping attestation.');
                return;
            }
            if (!repo) {
                console.log('repo is not available, skipping attestation.');
                return;
            }
            if (!branch) {
                console.log('branch is not available, skipping attestation.');
                return;
            }
            if (!username) {
                console.log('username is not available, skipping attestation.');
                return;
            }
            if (!allowedBranches.includes(branch)) {
                console.log(`branch "${branch}" is not an allowed branch, skipping attestation.`);
                return;
            }
            const isPullRequestMerged = !!github.context.payload.pull_request && github.context.payload.action == 'closed' && github.context.payload.pull_request.merged;
            if (!isPullRequestMerged) {
                console.log('event is not a pull request merge, skipping attestation.');
                return;
            }
            console.log('Inputs:', {
                allowedBranches,
                network,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequest
            });
            const { hash, uid } = yield (0, attest_1.attest)({
                privateKey,
                network,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequest
            });
            console.log('Transaction hash:', hash);
            console.log('New attestation UID:', uid);
            console.log('Setting outputs...');
            core.setOutput('hash', hash);
            core.setOutput('uid', uid);
            console.log('Done!');
        }
        catch (err) {
            console.log('... an error occurred in this step.');
            core.setFailed(err.message);
        }
    });
}
main().catch(error => core.setFailed(error.message));
