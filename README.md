# Sardines are Good

DAOs are Good is a web application built using the Azle library, which is a TypeScript CDK for the Internet Computer. The application provides users with a platform to share and discover sardine-related content.

# Prerequisites

Before you can install and use DAOs are Good, you'll need to install the DFX and Azle library on your machine. See the [Azle installation documentation](https://demergent-labs.github.io/azle/installation.html) for instructions.

### System Requirements

Before installing DFX and Azle, make sure that your machine meets the minimum system requirements. For DFX, the recommended specifications include at least 16GB of RAM, a quad-core processor, and a solid-state drive (SSD) with at least 100GB of free space. For Azle, you'll need Node.js version 14 or higher, as well as NPM (Node Package Manager) version 6 or higher.

### Install Node.js and NPM

If you don't have Node.js and NPM already installed on your machine, you'll need to download and install them before you can install Azle. You can download the latest version of Node.js from the official website at https://nodejs.org/en/download/. Once you've installed Node.js, you should have access to NPM as well.

### Install DFX

To install DFX, follow the instructions provided in the official documentation for your specific operating system. For example, if you're using macOS, you can run the following command in your terminal:

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

### Install Azle
Once you have Node.js and NPM installed, you can install Azle using the following command:
```bash
npm install -g @dfinity/azle

```
This will install the latest version of Azle globally on your machine, so you can use it from anywhere in your terminal.

### Ledger Local Setup

If you want to test your application that integrates with the ICP ledger locally, you will need to deploy a local ledger canister. Follow the steps below to deploy your copy of the ledger canister to a local replica.

```bash
export IC_VERSION=2694487bb5594f68b43e1dc795142a8e48b45715
curl -o ledger.wasm.gz "https://download.dfinity.systems/ic/$IC_VERSION/canisters/ledger-canister_notify-method.wasm.gz"
gunzip ledger.wasm.gz
curl -o ledger.private.did "https://raw.githubusercontent.com/dfinity/ic/$IC_VERSION/rs/rosetta-api/ledger.did"

dfx new myproject
cd myproject

# Copy the ledger canister module and Candid interface files into the root of your DFX project.

# Add the following canister definition to the dfx.json file in your project:
# {
#   "canisters": {
#     "ledger": {
#       "type": "custom",
#       "wasm": "ledger.wasm",
#       "candid": "ledger.private.did"
#     }
#   }
# }

# Configure your replica to run a System subnet by adding the following code to the dfx.json file:
# {
#   "defaults":{
#     "replica": {
#       "subnet_type":"system"
#     }
#   }
# }

# Deploy the ledger canister to your network.

# If you want to setup the ledger in a way that matches the production deployment, you should deploy it with archiving enabled. See the documentation for details.

# Update the canister definition in the dfx.json file to use the public Candid interface and specify a remote id for the ledger.

# Check that the Ledger canister is healthy.

```


## Installation

To install DAOs are Good, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install the required packages using npm:

```
npm install

```

## Usage

To use DAOs are Good, open a terminal and navigate to the project directory. Then, run the following command to start the local development server:


This will start the development server and launch the web interface in your default browser.

```
dfx start;
dfx deploy;
npm start;

```

## Token Parameters

The DAOs are Good has the following parameters in cig-config.json:

- `decimal` (number): The number of decimal places to use when displaying the token value. In this case, it's set to `8`.

- `fee` (string): The fee associated with using the token. In this case, it's set to `"0"`, indicating that there are no fees associated with the token.

- `name` (string): The name of the token. In this case, it's set to `"Non Profit"`.

- `symbol` (string): The symbol of the token. In this case, it's set to `"NP"`.

- `proposalDuration` (number): The duration in seconds for a proposal to be active before it expires. In this case, it's set to `61`.

- `proposalCost` (string): The cost associated with creating a proposal. In this case, it's set to `"26500000000"`.

- `initialSupply` (string): The initial supply of the token. In this case, it's set to `"300000000000000"`.

- `airdropAmount` (string): The amount of tokens to be distributed during the airdrop. In this case, it's set to `"100000000000000"`.

- `tokenDistributionAmount` (string): The amount of tokens to be distributed during the token distribution. In this case, it's set to `"100000000000000"`.

- `distributionExchangeRate` (number): The exchange rate for the token distribution. In this case, it's set to `1000`.

- `stake` (object): An object containing the duration of the stake in seconds. In this case, it's set to `{"duration": 10}`.

- `custodian` (array): An array of custodian addresses. In this case, it contains a single address: `"bccux-unsg4-wmiio-tnimk-hmgtj-7zwoa-p7oxs-oc5ks-7btcc-tlfcq-zae"`.

## TODO
- [ ] Add voting rewards 
- [ ] Add transaction archiving

## Contributing

If you'd like to contribute to DAOs are Good, feel free to open a pull request or issue on GitHub. Contributions are welcome and appreciated!

Before contributing, please read the [contributing guidelines](CONTRIBUTING.md)

## Credits

DAOs are Good was created by Daniel Andrade using the Azle library developed by Demergent Labs.

## License

DAOs are Good is licensed under the [GPL v3 License](LICENSE.md).