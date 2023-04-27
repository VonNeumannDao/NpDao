import React from 'react';
import {Button, Card, CardActions, CardContent, Link, Typography} from '@mui/material';
import {isDebugOn} from "./DebugOnly";

type Props = {
    icon: React.ReactNode;
    symbol: string;
    balance: string;
    title?: string;
    canisterId?: string;
};
const getLink = (canisterId) => {
    if (isDebugOn) {
        return `http://127.0.0.1:4943/?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai&id=${canisterId}`;
    } else {
        return `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${canisterId}`;
    }
};
const BalanceCard = ({ icon, symbol, balance, title, canisterId }: Props) => {
    return (
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: "162px", marginTop: "8px" }}>
            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                <span style={{ marginTop: '5px', marginBottom: '8px' }}>{icon}</span>
                <Typography variant="h5" component="h2" style={{ marginBottom: '8px', textAlign: 'center' }}>
                    {title}
                </Typography>
                <Link sx={{fontSize: "1rem"}} href={getLink(canisterId)}>{canisterId}</Link>
                <Typography variant="body1" style={{ textAlign: 'center' }}>
                    {balance +` ${symbol}`}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default BalanceCard;
