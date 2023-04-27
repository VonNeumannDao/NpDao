import React, {useEffect, useState} from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Paper, CircularProgress, Typography, CardContent, Card,
} from '@mui/material';
import {_SERVICE, IcrcTransaction} from "../declarations/token/token.did";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import {useCanister} from "@connect2ic/react";


export default function TransactionTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [transactions, setTransactions] = useState<IcrcTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    useEffect(() => {
        setLoading(true);

        async function init() {
            const start = BigInt(page) * BigInt(rowsPerPage);
            const length = BigInt(rowsPerPage);
            const result = await tokenActor.get_transactions({ start, length });
            setTransactions(result.transactions);
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
        <TableContainer component={Paper} sx={{marginTop: "20px"}}>
            <Table>
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
                        .map((transaction) => (
                            <TableRow key={transaction.timestamp.toString(10)}>
                                <TableCell>
                                    {transaction.timestamp.toString(10)}
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
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={5} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={transactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {loading && (
                <Card style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                    <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection:"column" }}>
                        <CircularProgress />
                        <Typography variant="subtitle1" align="center">Loading transactions. This might take a minute.</Typography>
                    </CardContent>
                </Card>
            )}
        </TableContainer>
    );
}
