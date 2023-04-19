rm -rf argFile.txt
echo " \
  \"(principal \"$(dfx identity get-principal)\", \
  text \"This is a proposal for a WebAssembly module.\", \
  text \"My Wasm Proposal\", \
  blob '$(base64 < .dfx/local/canisters/backend/backend.wasm)', \
  null, \
  null)\"" >> argFile.txt
