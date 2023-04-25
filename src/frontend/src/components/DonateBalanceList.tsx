import React from 'react';
import {Box, Card, CardContent, CircularProgress, Grid, Typography} from '@mui/material';
import BalanceCard from "./BalanceCard";

export type Balance = {
    icon: React.ReactNode;
    symbol: string;
    balance: string;
    title?: string;
};

type Props = {
    balances: Balance[];
    loading: boolean;
};

const DonateBalanceList: React.FC<Props> = ({ balances, loading }) => {
    function Spinner() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress style={{ marginBottom: '16px' }} />
                <p style={{ marginTop: 0 }}>Loading balances.</p>
                <p style={{ marginTop: 0 }}>This might take a minute...</p>
            </div>
        );
    }
    return (
        <Card sx={{marginTop:"20px"}}>
            <CardContent>
                <Box textAlign="center">
                    <Typography variant="h5" component="h2">
                        XTC Balances
                    </Typography>
                </Box>
                {loading && <Spinner/>}
                {!loading && <>
                    <Grid container spacing={3}>
                        {balances.map((card, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                                <BalanceCard {...card} />
                            </Grid>
                        ))}
                    </Grid>
                </>}
            </CardContent>
        </Card>
    );
};

export default DonateBalanceList;
