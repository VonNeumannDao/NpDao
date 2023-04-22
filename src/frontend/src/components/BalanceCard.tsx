import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

type Props = {
    icon: React.ReactNode;
    symbol: string;
    balance: string;
    title?: string;
};

const BalanceCard = ({ icon, symbol, balance, title }: Props) => {
    return (
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: "162px", marginTop: "8px" }}>
            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                <span style={{ marginTop: '5px', marginBottom: '8px' }}>{icon}</span>
                <Typography variant="h5" component="h2" style={{ marginBottom: '8px', textAlign: 'center' }}>
                    {title}
                </Typography>
                <Typography variant="body1" style={{ textAlign: 'center' }}>
                    {balance +` ${symbol}`}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default BalanceCard;
