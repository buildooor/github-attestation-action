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
const core = require('@actions/core');
const github = require('@actions/github');
const { onchain } = require('./attest');
function main() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Reading inputs...');
            // const inputOptions: core.InputOptions = { required: false, trimWhitespace: true };
            const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true });
            const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true });
            const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia';
            const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || '';
            const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || [];
            const allowedBranches = (_branches === null || _branches === void 0 ? void 0 : _branches.length) ? _branches : [_branch];
            const onPullRequestMerged = true; // core.getBooleanInput('on-pull-request-merged', { required: false, trimWhitespace: true }) || true
            if (!onPullRequestMerged) {
                throw new Error('on-pull-request-merged must be true or not set');
            }
            if (!privateKey) {
                throw new Error('private-key is required');
            }
            if (!rpcUrl) {
                throw new Error('rpc-url is required');
            }
            if (!network) {
                throw new Error('network is required');
            }
            if (network !== 'sepolia') {
                throw new Error('only sepolia network is supported');
            }
            const pullRequest = (_c = (_b = (_a = github.context) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.pull_request) === null || _c === void 0 ? void 0 : _c.number;
            const repo = (_f = (_e = (_d = github.context) === null || _d === void 0 ? void 0 : _d.payload) === null || _e === void 0 ? void 0 : _e.repository) === null || _f === void 0 ? void 0 : _f.full_name;
            const branch = (_g = github === null || github === void 0 ? void 0 : github.context) === null || _g === void 0 ? void 0 : _g.ref;
            const username = (_l = (_k = (_j = (_h = github.context) === null || _h === void 0 ? void 0 : _h.payload) === null || _j === void 0 ? void 0 : _j.pull_request) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l.login;
            if (!pullRequest) {
                console.log('pull request number is not available');
                return;
            }
            if (!repo) {
                console.log('repo is not available');
                return;
            }
            if (!branch) {
                console.log('branch is not available');
                return;
            }
            if (!username) {
                console.log('username is not available');
                return;
            }
            if (!allowedBranches.includes(branch)) {
                console.log(`branch ${branch} is not allowed`);
                return;
            }
            const isPullRequestMerged = !!github.context.payload.pull_request && github.context.payload.action == 'closed' && github.context.payload.pull_request.merged == true;
            if (onPullRequestMerged && !isPullRequestMerged) {
                console.log('pull request is not merged');
                return;
            }
            console.log('Inputs:', {
                allowedBranches,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequest
            });
            const hash = yield onchain({
                privateKey,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequest
            });
            console.log('Setting outputs...');
            core.setOutput("hash", hash);
            console.log('Done!');
        }
        catch (err) {
            console.log('... an error occurred in this step.');
            core.setFailed(err.message);
        }
    });
}
main().catch(error => core.setFailed(error.message));
