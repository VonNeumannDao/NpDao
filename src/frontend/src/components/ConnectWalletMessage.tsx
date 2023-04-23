import * as React from "react";
import {Box, Paper, Typography} from "@mui/material";
import {AccountBalanceWallet} from "@mui/icons-material";

function ConnectWalletMessage() {
    return (
        <Paper
            sx={{
                height: "25vh",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            <AccountBalanceWallet/>
            <Typography variant="h5" align="center">
                connect your wallet
            </Typography>
        </Paper>
    );
}

export default ConnectWalletMessage;
