import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    CardContent, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";
import config from "../../../../cig-config.json";
import LoadingButton from "@mui/lab/LoadingButton";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE as ledgerService} from "../declarations/ledger/ledger.did";
import {_SERVICE} from "../declarations/token/token.did";
import {useAppContext} from "./AppContext";

export default function DonateICP() {
    const [_ledger] = useCanister("ledger");
    const ledgerActor = _ledger as unknown as ledgerService;
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {principal} = useConnect();
    const {setBalanceVal} = useAppContext();

    const [exchangeRate, setExchangeRate] = useState<BigInt>(0n);
    const [exchangeRateDisplay, setExchangeRateDisplay] = useState<string>("0");
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

    useEffect(() => {
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
        const decimals = await ledgerActor.decimals();
        // const result = await tokenActor.distributeToken(convertToBigInt(amount, decimals));
        setIsLoading(false);
        setAmount("");
    };

    return <Card variant="outlined" sx={{marginTop: 2}}>
        <CardContent>
            <Typography variant="h5" align="center" gutterBottom style={{marginTop: "16px", marginBottom: "32px"}}>
                Donate ICP tokens
            </Typography>

            <Typography variant="body1" gutterBottom style={{marginBottom: "8px"}}>
                By donating ICP to the {config.name} DAO, you agree to the following terms and conditions:
            </Typography>

            <Typography variant="body1" gutterBottom style={{marginLeft: "16px", marginBottom: "8px"}}>
                {config.symbol} token has no team, road map, and will not be doing marketing. {config.name} is a
                fully decentralized autonomous organization and will exist for as long as developers want to deploy
                applications on it.
            </Typography>

            <Typography variant="body1" style={{marginTop: "32px"}}>
                By donating ICP to the {config.name} DAO, you acknowledge that you have read and understood these terms
                and conditions, and that you consent to donate the specified amount of ICP to the {config.name} DAO in
                accordance with these terms and conditions.
            </Typography>

            <Typography variant="h6" sx={{mb: 1}}>
                Exchange Rate: 1 ICP = {exchangeRate.toString(10)} {config.symbol}
            </Typography>
            <TextField
                fullWidth
                label="Amount"
                variant="outlined"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                InputProps={{
                    inputProps: {
                        step: 0.00000001,
                        min: 0,
                    },
                    endAdornment: "ICP",
                }}
                sx={{mt: 2}}
            />
            <Typography variant="h6" sx={{mt: 1}}>
                {`${exchangeRateDisplay} ${config.symbol}`}
            </Typography>
            <LoadingButton loading={isLoading} fullWidth variant="contained" color="primary" onClick={handleDonateClick}
                           sx={{mt: 2}}>
                Donate
            </LoadingButton>
            <Dialog open={open} onClose={handleDialogClose}>
                <DialogTitle>Confirm Donation</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" align="justify" gutterBottom>
                        By clicking "Confirm", you agree that you have read and understand the donation agreement, and
                        that you consent to donate the specified amount of XTC to the Non Profit DAO.
                    </Typography>
                    <FormControlLabel
                        control={<Checkbox checked={agreementChecked} onChange={handleAgreementChange}/>}
                        label="I have read and understand the donation agreement"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleConfirmDonate} color="secondary" disabled={!agreementChecked}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </CardContent>
    </Card>;
}
