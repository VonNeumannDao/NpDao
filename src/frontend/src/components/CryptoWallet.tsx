import React, {useEffect, useState} from 'react';
import {Box, Card, CardContent, Grid, TextField, Button, Typography, InputAdornment} from '@mui/material';
import { Send as SendIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import config from "../../../../cig-config.json";
import {Link} from "react-router-dom";
import {StyledLink} from "./StyledComponents";
import {useAppContext} from "./AppContext";
import {useCanister, useConnect} from "@connect2ic/react";
import {AccountIdentifier, SubAccount} from "@dfinity/nns";
import {Principal} from "@dfinity/principal";
import { SHA256, enc } from 'crypto-js';
import {
    bigIntToDecimal,
    convertToBigInt,
    stringToUint8,
    stringToUint8Array,
    uint8ArrayToString
} from "../util/bigintutils";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {canisterId as tokenCanister} from "../declarations/icrc_1";

type CryptoWalletProps = {};

const CryptoWallet: React.FC<CryptoWalletProps> = () => {
    const [coinBalance, setCoinBalance] = useState<string>();
    const [coinStaked, setCoinStaked] = useState<string>();
    const [toError, setToError] = useState("");
    const [toValue, setToValue] = useState("");
    const [coinTransferAmount, setCoinTransferAmount] = useState("");
    const [coinTransferAmountError, setCoinTransferAmountError] = useState("");
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {setBalanceVal, balancePretty, balance} = useAppContext();
    const {principal, isConnected} = useConnect();
    useEffect(() => {
        if (isConnected) {
            init().then();
        }
    }, [principal, isConnected]);
    const init = async () => {

    }

    const principalRegex = /^(?:[a-z0-9]+-){11}[a-z0-9]+$/i;

    const handleToValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        // Regular expression pattern to match
        // Check if the input matches the pattern
        const isValid = principalRegex.test(value);

        // Set the value and error state based on the result of the validation
        setToValue(value);
        setToError(isValid ? "" : "Invalid principal");
    };

    const handleCoinTransferAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);

        if (value <= 0) {
            setCoinTransferAmountError("Amount must be positive");
        } else if (value > Number(bigIntToDecimal(balance).getValue())) {
            setCoinTransferAmountError("Amount exceeds balance");
        } else {
            setCoinTransferAmountError("");
        }

        setCoinTransferAmount(value.toString());
    };

    const handleMaxButton = () => {
        setCoinTransferAmount(balancePretty.toString().replace(",", ""));
    };

    const handleCoinTransferButton = async () => {
        const failed = await tokenActor.icrc1_transfer({
            to: {
                owner: Principal.fromText(toValue),
                subaccount: []
            },
            fee: [],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            amount: convertToBigInt(coinTransferAmount),
        });

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
                                        placeholder="2vxsx-fae"
                                        helperText="Principal to transfer to"
                                        value={toValue}
                                        onChange={handleToValueChange}
                                        error={!!toError}
                                        sx={{ marginBottom: "8px", marginRight: "8px" }}
                                    />

                                    <TextField
                                        label="Transfer Amount"
                                        value={coinTransferAmount}
                                        onChange={handleCoinTransferAmountChange}
                                        fullWidth
                                        type="number"
                                        InputProps={{
                                            inputProps: {
                                                step: 0.00000001,
                                                min: 0,
                                            },
                                            endAdornment: <InputAdornment position="end">{config.symbol}</InputAdornment>,
                                        }}
                                        error={!!coinTransferAmountError}
                                        helperText={coinTransferAmountError || `Balance: ${balancePretty} ${config.symbol}`}
                                        sx={{ marginBottom: "8px", marginRight: "8px" }}
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