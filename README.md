# GitHub PR Attestation Action

> A GitHub PR Attestation Action that automatically make an attestation to the [Ethereum Attestation Service](https://easscan.org/) every time a PR is merged into a repository's main branch. This attestation contains a reference to the repository, the specific PR number, the branch name the PR was merged to, and the GitHub username of the account that created the PR.

## Inputs

### `private-key`

**Required** The private key to use for signing and submitting attestation transactions.

### `network`

**Required** The ethereum network to use. Default `"sepolia"`, Options are `"mainnet"`, `"sepolia"`, `"optimism-goerli"`.

### `rpc-url`

The RPC URL to use. A default one will be used if not specified.

### `branch`

The main branch to trigger attestations on when PR is merged. Default `"main"`

## Outputs

### `hash`

Transaction hash of the attestation submission.

### `uid`

UID of the attestation.

## Example usage

```yaml
name: hello-world
on:
  pull_request:
    types: [closed]

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - name: Attestation
        id: attestation
        uses: buildooor/github-attestation-action@master
        with:
          private-key: ${{ secrets.PRIVATE_KEY }}
          rpc-url: ${{ secrets.RPC_URL }}
          network: sepolia
          branch: master
```

An example job that ran using this action can be viewed here:

https://github.com/buildooor/github-action-test/actions/runs/5235160033/jobs/9451797252

The example job attestation tx:

https://sepolia.etherscan.io/tx/0x419d5c1a845c38a4ba25596286f00ab39208c62312ee27e703b8bb7097a470d5

The example job attestation on EAS:

https://sepolia.easscan.org/attestation/view/0xe1166d38f2edae4e2373c800cbb7af1be4845b2bdf356c8a3cd0daea3ae1a7be

## Development

Install dependencies:

```sh
npm install
```

Build:

```sh
npm run build
```

## References

- [Ecosystem Project Idea: GitHub PR Attestation Bot#67](https://github.com/orgs/ethereum-optimism/projects/31/views/4?pane=issue&itemId=29632592)

## License

[MIT](LICENSE)
