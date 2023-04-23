import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, Grid, TextField, Button, Typography, InputAdornment} from '@mui/material';
import { Send as SendIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import config from "../../../../cig-config.json";
import {Link} from "react-router-dom";
import {StyledLink} from "./StyledComponents";
import {useAppContext} from "./AppContext";
import {useConnect} from "@connect2ic/react";
import {AccountIdentifier, SubAccount} from "@dfinity/nns";
import {Principal} from "@dfinity/principal";
import { SHA256, enc } from 'crypto-js';
import {stringToUint8Array, uint8ArrayToString} from "../util/bigintutils";

type CryptoWalletProps = {};

const CryptoWallet: React.FC<CryptoWalletProps> = () => {
    const [coinBalance, setCoinBalance] = useState<string>();
    const [coinStaked, setCoinStaked] = useState<string>();
    const [coinTransferAmount, setCoinTransferAmount] = useState<string>();
    const {setBalanceVal, balancePretty} = useAppContext();
    const {principal, isConnected} = useConnect();
    useEffect(() => {
        if (isConnected) {
            init().then();
        }
    }, [principal, isConnected]);
    const init = async () => {

    }

    const handleMaxButton = () => {
    };

    const handleCoinTransferButton = () => {

    };

    const handleCoinStakeButton = () => {
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 'auto' }}>
            <Card sx={{ width: '100%', marginBottom: '16px' }}>
                <CardContent>
                    <Typography variant="h5" component="h2" sx={{textAlign: "left" }}>
                        Balance: {balancePretty} {config.symbol}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ marginBottom: '8px', textAlign: "left" }}>
                        {principal}
                    </Typography>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: '5px'}}>

                                <Box sx={{ borderTop: '1px solid #eee', padding: '16px', display: "flex", flexDirection: "row", flexGrow: 1 }}>

                                    <TextField
                                        label="To"
                                        fullWidth
                                        placeholder={"2vxsx-fae"}
                                        helperText={`Principal to transfer to`}
                                        sx={{ marginBottom: '8px', marginRight: '8px' }}
                                    />

                                    <TextField
                                        label="Transfer Amount"
                                        value={coinTransferAmount}
                                        onChange={(e) => setCoinTransferAmount(e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{config.symbol}</InputAdornment>,
                                        }}
                                        helperText={`Balance: ${balancePretty} ${config.symbol}`}
                                        sx={{ marginBottom: '8px', marginRight: '8px' }}
                                    />
                                    <Button
                                        variant="contained"
                                        size={"small"}
                                        onClick={handleCoinTransferButton}
                                        sx={{ marginRight: '8px', height: '56px' }}
                                    >
                                        <SendIcon />
                                    </Button>
                                    <Button
                                        size={"small"}
                                        sx={{ height: '56px' }}
                                        variant="outlined" onClick={handleMaxButton}>
                                        Max
                                    </Button>
                                </Box>
                            </Card>
                                <StyledLink to="/staking">
                                    View all staking
                                </StyledLink>
                        </Grid>
                </CardContent>
            </Card>
        </Box>
            );
        }

export default CryptoWallet;