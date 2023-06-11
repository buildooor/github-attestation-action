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
            const onPullRequestMerged = core.getBooleanInput('on-pull-request-merged', { required: false, trimWhitespace: true }) || false;
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
            const pullRequest = github.context.payload.pull_request.number;
            const repo = github.context.payload.repository.full_name;
            const branch = github.context.ref;
            const username = github.context.payload.pull_request.user.login;
            if (!allowedBranches.includes(branch)) {
                console.log(`branch ${branch} is not allowed`);
                return;
            }
            console.log(github.event);
            console.log(github.context);
            const isPullRequestMerged = github.context.eventName == 'pull_request' && github.event.action == 'closed' && github.context.payload.pull_request.merged == true;
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
