const core = require('@actions/core')
const github = require('@actions/github')
const { onchain } = require('./attest')

async function main() {
  try {
    console.log('Reading inputs...');
    // const inputOptions: core.InputOptions = { required: false, trimWhitespace: true };
    const inputOptions = { required: false, trimWhitespace: true };
    const privateKey = core.getInput('private-key', inputOptions);

    if (!privateKey) {
      throw new Error('private-key is required')
    }

    const pullRequest = github.context.payload.pull_request
    const repo = github.context.payload.repository.full_name
    const branch = github.context.ref
    const username = pullRequest.user.login

    console.log('Inputs:', {
      repo,
      branch,
      username,
      pullRequest
    });

    const hash = await onchain({
      privateKey,
      repo,
      branch,
      username,
      pullRequest
    })

    console.log('Setting outputs...');
    core.setOutput("hash", hash);

    console.log('Done!');
  }
  catch (error) {
    console.log('... an error occurred in this step.');
    core.setFailed(JSON.stringify(error));
  }
}

main().catch(error => core.setFailed(error.message))
