# GitHub PR Attestation Action

> A GitHub PR Attestation Action that automatically make an attestation to the [Ethereum Attestation Service](https://optimism-goerli.easscan.org/) every time a PR is merged into a repository's main branch. This attestation contains a reference to the repository, the specific PR number, the branch name the PR was merged to, and the GitHub username of the account that created the PR.

## Inputs

### `private-key`

**Required** The private key to use for signing and submitting attestation transactions.

### `network`

**Required** The ethereum network to use. Default `"sepolia"`.

### `rpc-url`

**Required** The RPC URL to use.

### `branch`

.The main branch to trigger attestations on when PR is merged. Default `"main"`

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
