dfx identity use minter
export MINT_ACC=$(dfx ledger account-id)
dfx identity use plug
export LEDGER_ACC=$(dfx ledger account-id)
dfx deploy ledger --argument '(record {minting_account = "'${MINT_ACC}'"; initial_values = vec { record { "'${LEDGER_ACC}'"; record { e8s=100_000_000_000 } }; }; send_whitelist = vec {}})'

