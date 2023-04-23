import * as React from "react";
import {Box, Icon, keyframes, Typography} from "@mui/material";
import {ArrowUpward, ArrowUpwardRounded} from "@mui/icons-material";
const floatAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;
function ConnectWalletMessage() {
    return (
        <Box
            sx={{
                height: "25vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
            }}
        >
            <Typography variant="h5" align="center">
                Please connect your wallet
            </Typography>
            <Box
                sx={{
                    position: "absolute",
                    right: "100px",
                    fontSize: "500px",
                    animation: `${floatAnimation} 2s ease-in-out infinite`,
                }}
            >
                <ArrowUpwardRounded color={"error"} fontSize="inherit" />
            </Box>
        </Box>
    );
}

export default ConnectWalletMessage;
