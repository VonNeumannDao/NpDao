import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {_SERVICE as TokenService, TransactionWithId} from "../declarations/token/token.did";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import {useCanister} from "@connect2ic/react";
import {SwapHoriz} from "@mui/icons-material";
import {_SERVICE as ArchiveService} from "../declarations/archive/archive.did";

export default function TransactionTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister("token");
    const [_archiveActor] = useCanister("archive");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const tokenActor = _tokenActor as unknown as TokenService;
    const archieActor = _archiveActor as unknown as ArchiveService;
    useEffect(() => {
        setLoading(true);

        async function init() {
            const start = BigInt(page) * BigInt(rowsPerPage);
            const length = BigInt(rowsPerPage);
            let transactions: TransactionWithId[];
            if (start > 1000) {
                transactions = (await archieActor.get_transactions({start, length})).transactions;
            } else if (start < 1000 && (start + length) <= 1000) {
                const trx = await tokenActor.get_transactions({start, length});
                transactions = trx.transactions;
            } else {
                transactions = (await tokenActor.get_transactions({start, length})).transactions;
                let secondaryTransactions = (await archieActor.get_transactions({
                    start: 0n,
                    length: length - BigInt(transactions.length)
                })).transactions;
                transactions.push(...secondaryTransactions);
            }

            const tranAmmount = await tokenActor.total_transactions();
            setTransactionAmount(Number(tranAmmount));
            setTransactions(transactions);
            setLoading(false);
        }

        init();

    }, [page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function truncateString(str) {
        if (isMobile && str.length > 8) {
            return "..." + str.slice(-8);
        } else {
            return str;
        }
    }

    return (
        <Card sx={{marginTop: '20px'}}>
            <CardHeader
                titleTypographyProps={{variant: 'h4'}}
                color={'secondary'}
                avatar={
                    <Avatar>
                        <SwapHoriz/>
                    </Avatar>
                }
                title="Transaction History"
            />
            <CardContent>
                <TableContainer sx={{height: "100%", margin: 0}}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {isMobile ?
                                    <>
                                        <TableCell>Block</TableCell>
                                        <TableCell>Data</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </>
                                    :
                                    <>
                                        <TableCell>Block</TableCell>
                                        <TableCell>Kind</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>From</TableCell>
                                        <TableCell>To</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </>}

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
                                        <TableCell>{transaction.id.toString(10)}</TableCell>
                                        {isMobile ?
                                            <>
                                                <TableCell>
                                                    <List>
                                                        <ListItem
                                                        >
                                                            <ListItemText
                                                                primary={"Date"}
                                                                secondary={new Date(Number(transaction.transaction.timestamp) / 1000000).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'numeric',
                                                                    day: 'numeric',
                                                                })}
                                                            />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary={"From"}
                                                                secondary={transaction.transaction.transfer.length > 0 ? truncateString(transaction.transaction.transfer[0].from.owner.toText()) : ""}
                                                            />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary={"to"}
                                                                secondary={transaction.transaction.transfer.length > 0 ? truncateString(transaction.transaction.transfer[0].to.owner.toText()) : ""}
                                                            />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary={"Kind"}
                                                                secondary={transaction.transaction.kind}
                                                            />
                                                        </ListItem>
                                                    </List>
                                                </TableCell>
                                                <TableCell>{transaction.transaction.transfer.length > 0 ? bigIntToDecimalPrettyString(transaction.transaction.transfer[0].amount) : ""}</TableCell>

                                            </>


                                            :

                                            <>
                                                <TableCell>{transaction.transaction.kind}</TableCell>
                                                <TableCell>
                                                    {new Date(Number(transaction.transaction.timestamp) / 1000000).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        second: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell>{transaction.transaction.transfer.length > 0 ? truncateString(transaction.transaction.transfer[0].from.owner.toText()) : ""}</TableCell>
                                                <TableCell>{transaction.transaction.transfer.length > 0 ? truncateString(transaction.transaction.transfer[0].to.owner.toText()) : ""}</TableCell>
                                                <TableCell>{transaction.transaction.transfer.length > 0 ? bigIntToDecimalPrettyString(transaction.transaction.transfer[0].amount) : ""}</TableCell>
                                            </>
                                        }
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
                            top: '55%',
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
