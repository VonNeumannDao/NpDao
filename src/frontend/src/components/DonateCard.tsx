import {
    AppBar,
    Container,
    Toolbar,
    Box,
    Menu,
    MenuItem,
    Divider,
    Typography,
    CircularProgress,
    Button, CardContent, CardActions, TextField
} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import { _SERVICE as _LEDGER_SERVICE } from '../ldl/ledgerIdlFactory.did';
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import {Principal} from "@dfinity/principal";
import { AccountIdentifier, SubAccount } from "@dfinity/nns";
export default function DonateCard() {
    const {connect, principal, isInitializing, disconnect, isConnected} = useConnect();
    const [_ledgerActor] = useCanister('ledger');
    const ledgerActor = _ledgerActor as unknown as _LEDGER_SERVICE;
    const [icp, setIcp] = useState(0);
    const [loading, setLoading] = useState(false);
    const decimals = 100000000;

    useEffect(() => {

    }, [principal]);

    async function onChange(e: any) {
        setIcp(e.target.value);
    }

    async function donate() {
        const donation = BigInt((Number(icp) * decimals).toFixed(0));
        const identifier = AccountIdentifier.fromPrincipal({
            principal: Principal.fromText("bccux-unsg4-wmiio-tnimk-hmgtj-7zwoa-p7oxs-oc5ks-7btcc-tlfcq-zae"),
            subAccount: SubAccount.ZERO,
        }).toNumbers();
        await ledgerActor.transfer({
            amount: { e8s: donation },
            memo: BigInt(0),
            fee: { e8s: BigInt(10000) },
            from_subaccount: [],
            created_at_time: [],
            to: identifier,
        });
    }


    return (
        <Card
            sx={{maxWidth: 300, marginTop: 50, marginLeft: "auto", marginRight: "auto"}}>
            <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                    A DEMO
                </Typography>
                <Typography variant="h5" component="div">
                    Sardines are Good
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ display: 'flex', marginLeft: "auto", marginRight:"auto", flexDirection: 'row', marginBottom: "4px", marginTop: "50px" }}>
                    <TextField type={"number"}
                               InputProps={{
                                   endAdornment: "ICP",
                               }}
                               value={icp} onChange={onChange} fullWidth label="Donate" id="fullWidth" />
                    <LoadingButton loading={loading} onClick={donate} variant="text">Donate</LoadingButton>
                </Box>
            </CardActions>
        </Card>
    );
}
