import React from "react";
import {
    Alert,
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

export default function DonateXTC(props:
{
    exchangeRate: BigInt,
    errorMessage: string | null,
    value: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    exchangeRateDisplay: string,
    loading: boolean,
    onClick: () => void,
    open: boolean,
    onClose: () => void,
    checked: boolean,
    onChange1: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onClick1: () => Promise<void>
}

) {
    return <Card variant="outlined" sx={{marginTop: 2}}>
        <CardContent>
            <Typography variant="h5" align="center" gutterBottom style={{marginTop: "16px", marginBottom: "32px"}}>
                Donate XTC tokens
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
            {props.errorMessage && props.errorMessage.length >0 &&
            <Alert severity="error">{props.errorMessage}</Alert>
            }
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
