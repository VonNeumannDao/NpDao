import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Grid, Paper, Typography} from '@mui/material';
import {AccountBalanceWallet, MoneyRounded} from '@mui/icons-material';
import InternetComputerIcon from "./InternetComputerIcon";
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {_SERVICE as ledgerService} from "../ldl/ledgerIdlFactory.did";

import {canisterId} from "../declarations/icrc_1";
import {Principal} from "@dfinity/principal";
import {AccountIdentifier, SubAccount} from "@dfinity/nns";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import config from "../../../../cig-config.json";
import BalanceCard from "./BalanceCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {isDebugOn} from "./DebugOnly";
import CryptoWallet from "./CryptoWallet";


const UtilityBar = () => {
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

        let icpBalancePromise = null;
        if (isDebugOn) {
            icpBalancePromise = async () => 0n;
        } else {
            icpBalancePromise = ledgerActor.account_balance({
                account: identifier
            });
        }
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
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
            }}>
                <CircularProgress style={{marginBottom: '16px'}}/>
                <p style={{marginTop: 0}}>Loading balances.</p>
                <p style={{marginTop: 0}}>This might take a minute...</p>
            </div>
        );
    }

    const cards = [
        {
            icon: <AccountBalanceWallet fontSize={"large"}/>,
            symbol: "$XTC",
            balance: divideByTrillion(cycleBalance),
            title: "Cycles"
        },
        {
            icon: <InternetComputerIcon fontSize={"large"}/>,
            symbol: "$ICP",
            balance: truncateDecimal(bigIntToDecimalPrettyString(icpBalance)),
            title: "ICP"
        },
        {
            icon: <MoneyRounded fontSize={"large"} />,
            symbol: `$${config.symbol}`,
            balance: truncateDecimal(bigIntToDecimalPrettyString(tokenBalance)),
            title: config.name
        },
        ...canisterTokenBalance.map((value) => ({
            icon: <AccountBalanceIcon fontSize={"large"}/>,
            symbol: `$XTC`,
            balance: divideByTrillion(value[1]),
            title: value[0]
        })),
    ];


    const balances = (

                <Paper sx={{display: "flex", flexWrap: "wrap"}}>
                    <Box flexGrow={2}>
                        <Box sx={{display: "flex", flexWrap: "wrap", padding: "16px", marginBottom: '16px', minHeight: "202px", minWidth: "400px"}}>
                            <Box textAlign="center" sx={{width: "100%"}}>
                                <Typography variant="h5" component="h2" textAlign={"center"}>
                                    DAO Balances
                                </Typography>
                                {loading && <Spinner/>}
                            </Box>

                            {!loading && <>
                                <Grid container spacing={1} justifyContent="center" wrap="wrap">
                                    {cards.map((card, index) => (
                                        <Grid item key={index} xs={4}>
                                            <BalanceCard {...card} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </>}
                        </Box>
                    </Box>
                    <Box sx={{maxWidth: "800px", margin: "auto"}} flexGrow={1}>
                        <CryptoWallet/>
                    </Box>
                </Paper>
    );

    function truncateDecimal(str: string): string {
        const parts = str.split('.');
        if (parts.length === 2) {
            const integerPart = parts[0];
            const decimalPart = parts[1].substr(0, 3);
            return `${integerPart}.${decimalPart}`;
        } else {
            return str;
        }
    }

    function divideByTrillion(num: bigint): string {
        const trillion = 1000000000000n;
        const result = parseFloat(num.toString(10)) / parseFloat(trillion.toString(10));
        return new Intl.NumberFormat('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}).format(result);
    }

    return (
        balances
    );
};

export default UtilityBar;
