import React, {useEffect, useState} from 'react';
import {Avatar, Box, Button, Card, CardContent, CardHeader, Grid, InputAdornment, Link, TextField} from '@mui/material';
import {Send as SendIcon, Wallet} from '@mui/icons-material';
import config from "../../../../cig-config.json";
import {useAppContext} from "./AppContext";
import {useCanister, useConnect} from "@connect2ic/react";
import {Principal} from "@dfinity/principal";
import {bigIntToDecimal, convertToBigInt} from "../util/bigintutils";
import {_SERVICE} from "../declarations/token/token.did";
import {Link as RouterLink} from 'react-router-dom';
import {LoadingButton} from "@mui/lab";

type CryptoWalletProps = {};

const CryptoWallet: React.FC<CryptoWalletProps> = () => {
    const [coinBalance, setCoinBalance] = useState<string>();
    const [coinStaked, setCoinStaked] = useState<string>();
    const [toError, setToError] = useState("");
    const [toValue, setToValue] = useState("");
    const [coinTransferAmount, setCoinTransferAmount] = useState("");
    const [coinTransferAmountError, setCoinTransferAmountError] = useState("");
    const [loading, setLoading] = useState(false);
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

    const principalRegex = /^(?:[a-z0-9]+-){10}[a-z0-9]+-?[a-z0-9]*$/i;

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
        setLoading(true);
        const failed = await tokenActor.icrc1_transfer({
            to: {
                owner: Principal.fromText(toValue),
                subaccount: []
            },
            fee: [],
            memo: [],
            from: {
                owner: Principal.fromText(principal),
                subaccount: []
            },
            created_at_time: [],
            amount: convertToBigInt(coinTransferAmount),
        });
        console.log(failed);
        const newBalance = await tokenActor.icrc1_balance_of({
                owner: Principal.fromText(principal),
                subaccount: []
        });
        setToValue("");
        setCoinTransferAmount("");
        setBalanceVal(newBalance);
        setLoading(false);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto'
        }}>
            <Box sx={{width: '100%', marginBottom: '16px'}}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'left',
                            alignItems: 'left',
                            marginBottom: '5px'
                        }}>
                            <CardHeader
                                titleTypographyProps={{variant: 'h6'}}
                                color={'secondary'}
                                subheader={principal}
                                avatar={
                                    <Avatar>
                                        <Wallet/>
                                    </Avatar>
                                }
                                title={`Balance: ${balancePretty} ${config.symbol}`}
                            />
                            <CardContent sx={{

                            }}>
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexGrow: 1
                                }}>

                                    <TextField
                                        label="To"
                                        fullWidth
                                        placeholder="2vxsx-fae"
                                        helperText="Principal to transfer to"
                                        value={toValue}
                                        onChange={handleToValueChange}
                                        error={!!toError}
                                        sx={{marginBottom: "8px", marginRight: "8px"}}
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
                                            endAdornment: <InputAdornment
                                                position="end">{config.symbol}</InputAdornment>,
                                        }}
                                        error={!!coinTransferAmountError}
                                        helperText={coinTransferAmountError || `Balance: ${balancePretty} ${config.symbol}`}
                                        sx={{marginBottom: "8px", marginRight: "8px"}}
                                    />
                                    <LoadingButton
                                        variant="contained"
                                        size={"small"}
                                        loading={loading}
                                        onClick={handleCoinTransferButton}
                                        disabled={!isConnected}
                                        sx={{marginRight: '8px', height: '56px'}}
                                    >
                                        <SendIcon/>
                                    </LoadingButton>
                                    <Button
                                        size={"small"}
                                        sx={{height: '56px'}}
                                        variant="outlined" onClick={handleMaxButton}>
                                        Max
                                    </Button>
                                </Box>
                                <Box
                                sx={{

                                    display: "flex",
                                    flexDirection: "row",
                                    flexGrow: 1
                                }}
                                >
                                    <Link component={RouterLink} to="/staking">
                                        View Staking
                                    </Link>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
            </Box>
        </Box>
    );
}

export default CryptoWallet;