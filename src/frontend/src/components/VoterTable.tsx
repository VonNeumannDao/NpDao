import React, {useState} from "react";
import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import {Voter} from "../declarations/icrc_1/icrc_1.did";
import {bigIntToDecimalPrettyString} from "../util/bigintutils";

type Props = {
    voters: Voter[];
};

const VoterTable: React.FC<Props> = ({voters}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, voters.length - page * rowsPerPage);

    const totalVotingPower = voters.reduce((acc, voter) => acc + voter.power, 0n);

    return voters.length > 0 ? (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Voter</TableCell>
                        <TableCell>Power</TableCell>
                        <TableCell>Direction</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(rowsPerPage > 0
                            ? voters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : voters
                    ).map((voter) => (
                        <TableRow key={voter.voter}>
                            <TableCell>{voter.voter}</TableCell>
                            <TableCell>{bigIntToDecimalPrettyString(voter.power)}</TableCell>
                            <TableCell>{voter.direction ? "Yay" : "Nay"}</TableCell>
                        </TableRow>
                    ))}
                    {emptyRows > 0 && (
                        <TableRow style={{height: 53 * emptyRows}}>
                            <TableCell colSpan={3}/>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={voters.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <Typography sx={{fontWeight: 'bold', paddingLeft: "20px"}} component={"span"}>Total power:</Typography>
            <Typography sx={{paddingLeft: "20px", paddingRight: "5px"}}
                        component={"span"}>{bigIntToDecimalPrettyString(totalVotingPower)}</Typography>
        </TableContainer>
    ) : (
        <Grid item xs={12}>
            <Typography variant="body1">No votes yet.</Typography>
        </Grid>
    );
};

export default VoterTable;
