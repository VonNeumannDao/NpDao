import * as React from "react";
import {Box, Paper, Typography} from "@mui/material";
import {AccountBalanceWallet} from "@mui/icons-material";
import {ConnectButton} from "@connect2ic/react";

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
            <ConnectButton style={{background: "white", color: "#404040" , marginRight: "10px"}} /> your wallet
        </Paper>
    );
}

export default ConnectWalletMessage;
