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
import {canisterId, idlFactory as ledgerFactory} from "./declarations/ledger";
import {isDebugOn} from "./components/DebugOnly";
import {canisterId as archiveCanisterId, idlFactory as archiveIdlFactory} from "./declarations/archive";

const ledgerCanister = isDebugOn ? canisterId : "ryjl3-tyaaa-aaaaa-aaaba-cai";
const whiteList = [ledgerCanister, "aanaa-xaaaa-aaaah-aaeiq-cai", tokenCanister, archiveCanisterId]

const globalProviderConfig = isDebugOn ? {
        whitelist: whiteList,
        appName: config.name,
        autoConnect: false,
    } :
    {
        whitelist: whiteList,
        appName: config.name,
        autoConnect: false,
        host: "https://icp0.io",
        dev: false,
        customDomain: "https://dev.icnonprofit.app"
    }
const client = createClient({
    globalProviderConfig,
    canisters: {
        ["ledger"]: {
            canisterId: ledgerCanister, idlFactory: ledgerFactory
        },
        ["token"]: {
            canisterId: tokenCanister, idlFactory: tokenIdlFactory
        },
        ["xtc"]: {
            canisterId: "aanaa-xaaaa-aaaah-aaeiq-cai", idlFactory: dip20Factory
        },
        ["archive"]: {
            canisterId: archiveCanisterId, idlFactory: archiveIdlFactory
        }
    },
    providers: defaultProviders,
});

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