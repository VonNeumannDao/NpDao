import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Card,
    CardContent, CardHeader,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';
import {_SERVICE, IcrcTransaction} from "../declarations/token/token.did";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import {useCanister} from "@connect2ic/react";
import {InfoRounded, SwapHoriz} from "@mui/icons-material";

export default function TransactionTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [transactions, setTransactions] = useState<IcrcTransaction[]>([]);
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    useEffect(() => {
        setLoading(true);

        async function init() {
            const start = BigInt(page) * BigInt(rowsPerPage);
            const length = BigInt(rowsPerPage);
            const result = await tokenActor.get_transactions({start, length});
            const tranAmmount = await tokenActor.total_transactions();
            setTransactionAmount(Number(tranAmmount));
            setTransactions(result.transactions);
            setRowsPerPage(result.transactions.length);
            setLoading(false);
        }

        init();
    }, [page, rowsPerPage, tokenActor]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows =
        rowsPerPage - Math.min(rowsPerPage, transactions.length - page * rowsPerPage);

    return (
        <Card sx={{margin: '20px'}}>
            <CardHeader
                titleTypographyProps={{ variant: 'h4' }}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <SwapHoriz />
                    </Avatar>
                }
                title="Transaction History"
            />
            <CardContent>
                <TableContainer component={Paper} sx={{height: "640px"}}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>From</TableCell>
                                <TableCell>To</TableCell>
                                <TableCell>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!loading && transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="subtitle1">No transactions found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && transactions.length > 0 && transactions
                                .map((transaction, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {new Date(Number(transaction.timestamp) / 1000000).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell>{transaction.from.length > 0 ? transaction.from[0].owner.toText() : ""}</TableCell>
                                        <TableCell>{transaction.args.length > 0 ? transaction.args[0].to.owner.toText() : ""}</TableCell>
                                        <TableCell>{transaction.args.length > 0 ? bigIntToDecimalPrettyString(transaction.args[0].amount) : ""}</TableCell>
                                    </TableRow>
                                ))}

                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={transactionAmount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

                    {loading && (
                        <Card style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1
                        }}>
                            <CardContent style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column"
                            }}>
                                <CircularProgress/>
                                <Typography variant="subtitle1" align="center">Loading transactions. This might take a
                                    minute.</Typography>
                            </CardContent>
                        </Card>
                    )}
                </TableContainer>
            </CardContent>
        </Card>
    );
}
