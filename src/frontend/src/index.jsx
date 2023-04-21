import * as React from "react";
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Main from "./Main";
import {AstroX, InfinityWallet, NFID, PlugWallet, StoicWallet} from "@connect2ic/core/providers"
import {createClient} from "@connect2ic/core"
import "@connect2ic/core/style.css"
import {Connect2ICProvider} from "@connect2ic/react"
import {idlFactory as ledgerFactory} from "./ldl/ledgerIdlFactory.did";
import {canisterId as backendCanisterId, idlFactory as backendFactory} from "./declarations/backend";
import {canisterId as tokenCanister, idlFactory as tokenIdlFactory} from "./declarations/icrc_1";
import {AppProvider} from "./components/AppContext";
import {idlFactory as dip20Factory} from "./ldl/dip20.did";
import {BrowserRouter} from "react-router-dom";

const client = createClient({
    globalProviderConfig: {
        whitelist: ["ryjl3-tyaaa-aaaaa-aaaba-cai", "aanaa-xaaaa-aaaah-aaeiq-cai", backendCanisterId, tokenCanister],
        dev: true
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
        },
        ["xtc"]: {
            canisterId: "aanaa-xaaaa-aaaah-aaeiq-cai", idlFactory: dip20Factory
        }
    },
    providers: [new PlugWallet()],
})
const container = document.getElementById('app');
const root = createRoot(container)
root.render(
    <BrowserRouter basename="/">
    <Connect2ICProvider client={client}>
        <AppProvider>
            <Main/>
        </AppProvider>
    </Connect2ICProvider>
    </BrowserRouter>);