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
            const inputOptions = { required: false, trimWhitespace: true };
            const privateKey = core.getInput('private-key', inputOptions);
            if (!privateKey) {
                throw new Error('private-key is required');
            }
            const pullRequest = github.context.payload.pull_request.number;
            const repo = github.context.payload.repository.full_name;
            const branch = github.context.ref;
            const username = github.context.payload.pull_request.user.login;
            console.log('Inputs:', {
                repo,
                branch,
                username,
                pullRequest
            });
            const hash = yield onchain({
                privateKey,
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
