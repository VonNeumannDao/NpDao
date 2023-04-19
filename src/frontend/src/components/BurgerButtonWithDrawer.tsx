import React, {useEffect, useState} from 'react';
import {CircularProgress, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import {AccountBalanceWallet, Menu as MenuIcon, MoneyRounded} from '@mui/icons-material';
import InternetComputerIcon from "./InternetComputerIcon";
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {_SERVICE as ledgerService} from "../ldl/ledgerIdlFactory.did";

import {canisterId} from "../declarations/icrc_1";
import {Principal} from "@dfinity/principal";
import {AccountIdentifier, SubAccount} from "@dfinity/nns";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import config from "../../../../cig-config.json";


const BurgerButtonWithDrawer = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [_tokenActor] = useCanister('token');
    const [_ledgerActor] = useCanister('ledger');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const ledgerActor = _ledgerActor as unknown as ledgerService;
    const [icpBalance, setIcpBalance] = useState(0n);
    const [cycleBalance, setCycleBalance] = useState(0n);
    const [loading, setLoading] = useState(false);
    const [tokenBalance, setTokenBalance] = useState(0n);
    const [canisterTokenBalance, setCanisterTokenBalance] = useState<[string, bigint][]>([]);

    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        setLoading(true);
        const cycleBalancesPromise = tokenActor.cycleBalances();
        const tokenBalancePromise = tokenActor.icrc1_balance_of({
            owner: Principal.fromText(canisterId),
            subaccount: []
        });
        const identifier = AccountIdentifier.fromPrincipal({
            principal: Principal.fromText(canisterId),
            subAccount: SubAccount.ZERO,
        }).toNumbers();
        const icpBalancePromise = ledgerActor.account_balance({
            account: identifier
        });

        const [cycleBalances, tokenBalance, icpBalance] = await Promise.all([cycleBalancesPromise, tokenBalancePromise, icpBalancePromise]);

        setCycleBalance(cycleBalances.find(x => x[0] === "DAO")[1] || 0n);
        setCanisterTokenBalance(cycleBalances.filter(x => x[0] !== "DAO"));
        setTokenBalance(tokenBalance);
        setIcpBalance(icpBalance.e8s);
        setLoading(false);
    }


    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };
    function Spinner() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <CircularProgress style={{marginBottom: '16px'}}/>
                <p style={{marginTop: 0}}>Loading balances for cycles.</p>
                <p style={{marginTop: 0}}>This might take a minute...</p>
            </div>
        );
    }
    const drawerContent = (
        <div>
            {loading && <Spinner/>}
            {!loading && <>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <AccountBalanceWallet/>
                        </ListItemIcon>
                        <ListItemText primary={`${bigIntToDecimalPrettyString(cycleBalance)} $Cycles`}/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InternetComputerIcon/>
                        </ListItemIcon>
                        <ListItemText primary={`${bigIntToDecimalPrettyString(icpBalance)} $ICP`}/>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <MoneyRounded/>
                        </ListItemIcon>
                        <ListItemText primary={`${bigIntToDecimalPrettyString(tokenBalance)} $${config.symbol}`}/>
                    </ListItem>
                </List>
                <Divider/>
                <List>
                    {canisterTokenBalance.map((value) => (
                        <ListItem key={value[0]}>
                            <ListItemText primary={`${divideByTrillion(value[1])} $TC ${value[0]}`}/>
                        </ListItem>
                    ))}
                </List>
            </>}
        </div>
    );

    function divideByTrillion(num: bigint): string {
        const trillion = 1000000000000n;
        const result = parseFloat(num.toString(10)) / parseFloat(trillion.toString(10));
        return new Intl.NumberFormat('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}).format(result);
    }

    return (
        <>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
            >
                <MenuIcon/>
            </IconButton>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default BurgerButtonWithDrawer;
