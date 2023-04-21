# Sardines are Good

Sardines are Good is a web application built using the Azle library, which is a TypeScript CDK for the Internet Computer. The application provides users with a platform to share and discover sardine-related content.

## Prerequisites

Before you can install and use Sardines are Good, you'll need to install the DFX and Azle library on your machine. See the [Azle installation documentation](https://demergent-labs.github.io/azle/installation.html) for instructions.

## Installation

To install Sardines are Good, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install the required packages using npm:

```
npm install

```

## Usage

To use Sardines are Good, open a terminal and navigate to the project directory. Then, run the following command to start the local development server:


This will start the development server and launch the web interface in your default browser.

```
dfx start;
dfx deploy;
npm start;

```

## Token Parameters

The Sardines are Good has the following parameters in cig-config.json:

- `decimal`: The number of decimal places to use when displaying token amounts. Default is 8.
- `fee`: The fee to be charged for token transactions. Default is 0.
- `name`: The name of the token. Default is "No Profit".
- `symbol`: The symbol of the token. Default is "NP".
- `initialSupply`: The initial supply of tokens. Default is 100,000,000,000,000.
- `proposalDuration`: The duration (in seconds) that a proposal can remain open for voting. Default is 259,200 (3 days).
- `proposalCost`: The cost (in NP) to create a new proposal. Default is 26500000000 with 8 decimals.

## TODO
- [ ] Add staking functionality
- [ ] Drain cycles when removing a WASM

## Contributing

If you'd like to contribute to Sardines are Good, feel free to open a pull request or issue on GitHub. Contributions are welcome and appreciated!

Before contributing, please read the [contributing guidelines](CONTRIBUTING.md)

## Credits

Sardines are Good was created by Daniel Andrade using the Azle library developed by Demergent Labs.

## License

Sardines are Good is licensed under the [GPL v3 License](LICENSE.md).