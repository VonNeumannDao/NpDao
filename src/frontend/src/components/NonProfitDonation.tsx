import React, {useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, FormControlLabel, Checkbox
} from '@mui/material';
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {_SERVICE as dip20Service} from "../ldl/dip20.did";
import {bigIntToDecimalPrettyString, convertToBigInt, divideByTrillion, hexToUint8Array} from "../util/bigintutils";
import {Principal} from "@dfinity/principal";
import LoadingButton from "@mui/lab/LoadingButton";
import {useAppContext} from "./AppContext";
import DonateBalanceList, {Balance} from "./DonateBalanceList";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {canisterId as tokenCanister} from "../declarations/icrc_1";
import config from "../../../../cig-config.json";

function DonateXTC(props: { exchangeRate: BigInt, value: string, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, exchangeRateDisplay: string, loading: boolean, onClick: () => void, open: boolean, onClose: () => void, checked: boolean, onChange1: (event: React.ChangeEvent<HTMLInputElement>) => void, onClick1: () => Promise<void> }) {
    return <Card variant="outlined" sx={{marginTop: 2}}>
        <CardContent>
            <Typography variant="h5" align="center" gutterBottom style={{marginTop: "16px", marginBottom: "32px"}}>
                Donate for {config.symbol} tokens
            </Typography>

            <Typography variant="body1" gutterBottom style={{marginBottom: "8px"}}>
                By donating XTC to the {config.name} DAO, you agree to the following terms and conditions:
            </Typography>

            <Typography variant="body1" gutterBottom style={{marginLeft: "16px", marginBottom: "8px"}}>
                1. {config.symbol} token has no team, road map, and will not be doing marketing. {config.name} is a
                fully decentralized autonomous organization and will exist for as long as developers want to deploy
                applications on it.
            </Typography>

            <Typography variant="body1" gutterBottom style={{marginLeft: "16px", marginBottom: "8px"}}>
                2. All XTC donated to {config.name} DAO will be burnt and turned into cycles for the DAO. Cycles can be
                used to pay for transaction fees and other costs associated with deploying applications on the Internet
                Computer.
            </Typography>

            <Typography variant="body1" style={{marginTop: "32px"}}>
                By donating XTC to the {config.name} DAO, you acknowledge that you have read and understood these terms
                and conditions, and that you consent to donate the specified amount of XTC to the {config.name} DAO in
                accordance with these terms and conditions.
            </Typography>

            <Typography variant="h6" sx={{mb: 1}}>
                Exchange Rate: 1 XTC = {props.exchangeRate.toString(10)} {config.symbol}
            </Typography>
            <TextField
                fullWidth
                label="Amount"
                variant="outlined"
                type="number"
                value={props.value}
                onChange={props.onChange}
                InputProps={{
                    inputProps: {
                        step: 0.00000001,
                        min: 0,
                    },
                    endAdornment: "XTC",
                }}
                sx={{mt: 2}}
            />
            <Typography variant="h6" sx={{mt: 1}}>
                {`${props.exchangeRateDisplay} ${config.symbol}`}
            </Typography>
            <LoadingButton loading={props.loading} fullWidth variant="contained" color="primary" onClick={props.onClick}
                           sx={{mt: 2}}>
                Donate
            </LoadingButton>
            <Dialog open={props.open} onClose={props.onClose}>
                <DialogTitle>Confirm Donation</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" align="justify" gutterBottom>
                        By clicking "Confirm", you agree that you have read and understand the donation agreement, and
                        that you consent to donate the specified amount of XTC to the Non Profit DAO.
                    </Typography>
                    <FormControlLabel
                        control={<Checkbox checked={props.checked} onChange={props.onChange1}/>}
                        label="I have read and understand the donation agreement"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={props.onClose} color="primary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={props.onClick1} color="secondary" disabled={!props.checked}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </CardContent>
    </Card>;
}

const NonProfitDonation: React.FC = () => {
    const [amount, setAmount] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBalancedLoading, setIsBalancesLoading] = useState<boolean>(false);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [exchangeRate, setExchangeRate] = useState<BigInt>(0n);
    const [exchangeRateDisplay, setExchangeRateDisplay] = useState<string>("0");

    const {setBalanceVal} = useAppContext();

    const [_tokenActor] = useCanister('token');
    const [_dip20Actor] = useCanister("xtc");
    const {principal} = useConnect();
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const dip20Actor = _dip20Actor as unknown as dip20Service;

    useEffect(() => {
        fetchBalances();
        init();
    }, [principal]);

    async function init() {
        const exchangeRate = await tokenActor.distributionExchangeRate();
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
        const result = await tokenActor.distributeToken(convertToBigInt(amount, decimals));
        setIsLoading(false);
        setAmount("");
        await fetchBalances();
    };

    async function fetchBalances() {
        if (principal) {
            setIsBalancesLoading(true);
            const cycleBalances = await tokenActor.cycleBalances();
            const balance = await tokenActor.icrc1_balance_of({
                owner: Principal.fromText(tokenCanister),
                subaccount: [hexToUint8Array("3fb3d3f31477a34a465b56f4e4d4a4a0fc8c58191e551c57e0447b0f16e56a7b")]
            });
            const myBalance = await tokenActor.icrc1_balance_of({
                owner: Principal.fromText(principal),
                subaccount: []
            });
            setBalanceVal(myBalance);
            const fetchedBalances: Balance[] = [
                {
                    title: "Distribution",
                    symbol: config.symbol,
                    balance: bigIntToDecimalPrettyString(balance),
                    icon: <AccountBalanceIcon/>
                },
                {
                    title: "Dao",
                    symbol: 'XTC',
                    balance: divideByTrillion(cycleBalances.find(x => x[0] === "DAO")[1] || 0n),
                    icon: <AccountBalanceIcon/>
                },
                {
                    title: "Account",
                    symbol: config.symbol,
                    balance: bigIntToDecimalPrettyString(myBalance),
                    icon: <AccountBalanceIcon/>
                }
            ];
            setBalances(fetchedBalances);
            setIsBalancesLoading(false);
        }
    }

    return (
        <Box sx={{marginTop:"20px"}}>
            <DonateBalanceList loading={isBalancedLoading} balances={balances}/>
            <DonateXTC exchangeRate={exchangeRate} value={amount} onChange={handleAmountChange}
                       exchangeRateDisplay={exchangeRateDisplay} loading={isLoading} onClick={handleDonateClick}
                       open={open} onClose={handleDialogClose} checked={agreementChecked}
                       onChange1={handleAgreementChange} onClick1={handleConfirmDonate}/>
        </Box>

    );
}

export default NonProfitDonation;
