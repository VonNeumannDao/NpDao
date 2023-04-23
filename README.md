# Sardines are Good

DAOs are Good is a web application built using the Azle library, which is a TypeScript CDK for the Internet Computer. The application provides users with a platform to share and discover sardine-related content.

## Prerequisites

Before you can install and use DAOs are Good, you'll need to install the DFX and Azle library on your machine. See the [Azle installation documentation](https://demergent-labs.github.io/azle/installation.html) for instructions.

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