import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel, Grid,
    TextField,
    Typography
} from '@mui/material';
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {_SERVICE as dip20Service} from "../ldl/dip20.did";

import {bigIntToDecimalPrettyString, convertToBigInt, hexToUint8Array} from "../util/bigintutils";
import {Principal} from "@dfinity/principal";
import {useAppContext} from "./AppContext";
import DonateBalanceList, {Balance} from "./DonateBalanceList";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {canisterId as tokenCanister} from "../declarations/token";
import config from "../../../../cig-config.json";
import DonateXTC from "./DonateXTC";
import DonateICP from "./DonateICP";

const NonProfitDonation: React.FC = () => {
    const [amount, setAmount] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBalancedLoading, setIsBalancesLoading] = useState<boolean>(false);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [exchangeRate, setExchangeRate] = useState<BigInt>(0n);
    const [exchangeRateDisplay, setExchangeRateDisplay] = useState<string>("0");

    const {reloadBalance, reloadDaoBalances} = useAppContext();

    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;

    const [_dip20Actor] = useCanister("xtc");
    const dip20Actor = _dip20Actor as unknown as dip20Service;

    const {principal} = useConnect();

    useEffect(() => {
        fetchBalances();
        init();
    }, [principal]);

    async function init() {
        const exchangeRate = await tokenActor.xtcDistributionExchangeRate();
        setExchangeRate(exchangeRate);
        setExchangeRateDisplay((0).toFixed(8))
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
        setExchangeRateDisplay((Number(event.target.value) * Number(exchangeRate)).toFixed(8))
    };

    const handleDonateClick = () => {
        setIsLoading(true);
        setOpen(true);
    };

    const handleAgreementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAgreementChecked(event.target.checked);
    };

    const handleDialogClose = () => {
        setOpen(false);
        setAgreementChecked(false);
    };

    const handleConfirmDonate = async () => {
        setOpen(false);
        const decimals = await dip20Actor.decimals();
        await dip20Actor.approve(Principal.fromText(tokenCanister), convertToBigInt(amount, decimals));
        const result = await tokenActor.xtcDistributeToken(convertToBigInt(amount, decimals));
        console.log(result);
        setAmount("");
        await Promise.all([fetchBalances(), reloadBalance(), init(), reloadDaoBalances()])
        setAgreementChecked(false);
        setIsLoading(false);
    };

    async function fetchBalances() {
        if (principal) {
            setIsBalancesLoading(true);
            const balance = await tokenActor.icrc1_balance_of({
                owner: Principal.fromText(tokenCanister),
                subaccount: [hexToUint8Array("3fb3d3f31477a34a465b56f4e4d4a4a0fc8c58191e551c57e0447b0f16e56a7b")]
            });


            const fetchedBalances: Balance[] = [
                {
                    title: "XTC Distribution",
                    symbol: config.symbol,
                    balance: bigIntToDecimalPrettyString(balance),
                    icon: <AccountBalanceIcon/>
                }
            ];
            setBalances(fetchedBalances);
            setIsBalancesLoading(false);
        }
    }

    return (
        <Box>
            <DonateBalanceList loading={isBalancedLoading} balances={balances}/>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                    <DonateXTC
                        exchangeRate={exchangeRate}
                        value={amount}
                        onChange={handleAmountChange}
                        exchangeRateDisplay={exchangeRateDisplay}
                        loading={isLoading}
                        onClick={handleDonateClick}
                        open={open}
                        onClose={handleDialogClose}
                        checked={agreementChecked}
                        onChange1={handleAgreementChange}
                        onClick1={handleConfirmDonate}
                    />
                </Grid>
                {/*<Grid item xs={12} sm={6}>*/}
                {/*    <DonateICP />*/}
                {/*</Grid>*/}
            </Grid>
        </Box>

    );
}

export default NonProfitDonation;
