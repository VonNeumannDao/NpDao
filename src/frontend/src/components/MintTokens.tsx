import {Box, CardActions, CardContent, List, ListItem, ListItemAvatar, Typography, ListItemText} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import {Principal} from "@dfinity/principal";
import {canisterId as tokenCanister} from "../declarations/icrc_1";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

export default function MintTokens() {
    const {connect, principal, isInitializing, disconnect, isConnected} = useConnect();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0n);

    const decimals = 100000000;

    useEffect(() => {
        init().then();
    }, [principal]);

    async function init(){
        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        })

        setBalance(balance);
    }


    async function mint() {
        setLoading(true);
        await tokenActor.mint_tokens();
        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        })

        setBalance(balance);
        setLoading(false);
    }


    return (
        <Card
            sx={{maxWidth: 600, marginTop: 50, marginLeft: "auto", marginRight: "auto"}}>
            <CardContent>
                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                    A DEMO
                </Typography>
                <Typography variant="h5" component="div">

                </Typography>

                Token: {tokenCanister}

                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <ImageIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Sardines are Good" />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <WorkIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Balance" secondary={(Number(balance) / decimals).toString(10)} />
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <BeachAccessIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Token" secondary={tokenCanister} />
                    </ListItem>
                </List>
            </CardContent>
            <CardActions>
                <Box sx={{ display: 'flex', marginLeft: "auto", marginRight:"auto", flexDirection: 'row', marginBottom: "4px", marginTop: "50px" }}>
                    <LoadingButton loading={loading} onClick={mint} variant="text">Mint</LoadingButton>
                </Box>
            </CardActions>
        </Card>
    );
}
