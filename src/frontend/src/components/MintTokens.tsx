import {CardContent, List, ListItem, ListItemAvatar, ListItemText, Typography} from '@mui/material';
import React, {useState} from 'react';
import {useCanister, useConnect} from '@connect2ic/react';
import Card from "@mui/material/Card";
import {canisterId as tokenCanister} from "../declarations/token";
import {_SERVICE} from "../declarations/token/token.did";
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import {useAppContext} from "./AppContext";

export default function MintTokens() {
    const {principal} = useConnect();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [loading, setLoading] = useState(false);
    const {setBalanceVal, balancePretty} = useAppContext();

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

                <List sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <ImageIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Sardines are Good"/>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <WorkIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Balance" secondary={balancePretty}/>
                    </ListItem>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar>
                                <BeachAccessIcon/>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Token" secondary={tokenCanister}/>
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
}
