#!/bin/bash

# Check if a file path has been provided
if [ -z "$1" ]; then
  echo "Path to wasm file missing"
  exit 1
fi

# Convert the file to a string of hexadecimal byte values
hex_string=$(xxd -p "$1" | tr -d '\n')

# Add a backslash at the beginning of the string
escaped_string="\\${hex_string:0:2}"
bytes_processed=2

# Add a backslash between each pair of hexadecimal digits
for i in $(seq 2 2 ${#hex_string}); do
  escaped_string="${escaped_string}\\${hex_string:$i:2}"
  bytes_processed=$((bytes_processed+2))
  bytes_remaining=$(((${#hex_string} - bytes_processed) / 2))

  # Print the number of bytes processed and the number of bytes remaining
  printf "Processed %d bytes, %d bytes remaining...\r" "$bytes_processed" "$bytes_remaining"
done

# Write the argument list to a file
rm -f argFile.txt
echo "(record { owner = principal \"$(dfx identity get-principal)\" }, \"This is a proposal for a WebAssembly module.\", \"My Wasm Proposal\", blob \"$escaped_string\", null, null, opt \"Test App Name\")" > argFile.txt

# Call the canister with the argument list
dfx canister call --argument-file argFile.txt icrc_1 createWasmProposal
