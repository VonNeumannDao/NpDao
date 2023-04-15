import * as React from "react";
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Main from "./Main";
import {defaultProviders, NFID, PlugWallet, StoicWallet} from "@connect2ic/core/providers"
import { createClient } from "@connect2ic/core"
import "@connect2ic/core/style.css"
import { ConnectButton, ConnectDialog, Connect2ICProvider, useConnect } from "@connect2ic/react"
import { idlFactory as ledgerFactory } from "./ldl/ledgerIdlFactory.did";
import {canisterId as backendCanisterId, idlFactory as backendFactory} from "./declarations/backend";
import {canisterId as tokenCanister, idlFactory as tokenIdlFactory} from "./declarations/icrc_1";

const client = createClient({
    globalProviderConfig: {
        whitelist: ["ryjl3-tyaaa-aaaaa-aaaba-cai", backendCanisterId],
    },
    canisters: {
        ["ledger"]: {
            canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai", idlFactory: ledgerFactory
        },
        ["backend"]: {
            canisterId: backendCanisterId, idlFactory: backendFactory
        },
        ["token"]: {
            canisterId: tokenCanister, idlFactory: tokenIdlFactory
        }
    },
    providers: [new PlugWallet(), new StoicWallet(), new NFID()],
})
const container = document.getElementById('app');
const root = createRoot(container)
root.render(
    <Connect2ICProvider client={client}>
        <Main/>
    </Connect2ICProvider>);