import * as React from "react";
import {createRoot} from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Main from "./Main";
import {Connect2ICProvider} from "@connect2ic/react"
import {defaultProviders} from "@connect2ic/core/providers"
import {createClient} from "@connect2ic/core"
import "@connect2ic/core/style.css"
import {canisterId as tokenCanister, idlFactory as tokenIdlFactory} from "./declarations/token";
import {AppProvider} from "./components/AppContext";
import {idlFactory as dip20Factory} from "./ldl/dip20.did";
import {BrowserRouter} from "react-router-dom";
import config from "../../../cig-config.json";
import {ThemeProvider} from "@mui/material";
import myTheme from "./ThemeImporter";
import {idlFactory as ledgerFactory, canisterId} from "./declarations/ledger";
import {isDebugOn} from "./components/DebugOnly";

const ledgerCanister = isDebugOn ? canisterId : "ryjl3-tyaaa-aaaaa-aaaba-cai";
const whiteList = [ledgerCanister, "aanaa-xaaaa-aaaah-aaeiq-cai", tokenCanister]
console.log(whiteList);
const client = createClient({
    globalProviderConfig: {
        whitelist: whiteList,
        appName: config.name,
        autoConnect: true,
        dev: isDebugOn
    },
    canisters: {
        ["ledger"]: {
            canisterId: ledgerCanister, idlFactory: ledgerFactory
        },
        ["token"]: {
            canisterId: tokenCanister, idlFactory: tokenIdlFactory
        },
        ["xtc"]: {
            canisterId: "aanaa-xaaaa-aaaah-aaeiq-cai", idlFactory: dip20Factory
        }
    },
    providers: defaultProviders,
})
const container = document.getElementById('app');
const root = createRoot(container)
root.render(
    <BrowserRouter basename="/">
    <Connect2ICProvider client={client}>
        <AppProvider>
            <ThemeProvider theme={myTheme}>
                <Main/>
            </ThemeProvider>
        </AppProvider>
    </Connect2ICProvider>
    </BrowserRouter>);