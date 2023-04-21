import React from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    CircularProgress, Box, Grid
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
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
    return (
        <Card>
            <CardContent>
                <Box textAlign="center">
                    <Typography variant="h5" component="h2">
                        Balances
                    </Typography>
                </Box>
                {loading && <CircularProgress/>}
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
