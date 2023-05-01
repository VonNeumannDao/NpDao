import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Typography
} from '@mui/material';
import {LoadingButton} from "@mui/lab";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {Principal} from "@dfinity/principal";
import {convertToBigInt} from "../util/bigintutils";
import ErrorDialog from "./ErrorDialog";


export default function ChangePriceProposal() {
    const {principal} = useConnect();
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [proposalCost, setProposalCost] = useState<string>();
    const noSpecialCharsRegex = /^[a-zA-Z0-9\s]*$/;
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await tokenActor.createChangePriceProposal({
            owner: Principal.fromText(principal),
            subaccount: []
        }, description, title, convertToBigInt(proposalCost));
        if ("Err" in response) {
            setError(true);
            setErrorMessage(JSON.stringify(response["Err"], (_, v) => typeof v === 'bigint' ? `${v}n` : v));
        } else {
            window.location.href = "/";
        }
        setLoading(false);
    };

    return (
        <Card sx={{ p: 5 }}>
            <CardHeader title={title} />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Box display={"flex"} flexDirection={"column"} sx={{ gap: 3 , minWidth: "400px"}}>
                        <TextField
                            label="Title"
                            value={title}
                            disabled
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            required
                            multiline
                            rows={5}
                            onKeyDown={e => e.stopPropagation()}
                            error={!noSpecialCharsRegex.test(description)}
                            helperText={
                                !noSpecialCharsRegex.test(description)
                                    ? 'Please enter a description without special characters.'
                                    : ''
                            }
                        />
                        <TextField
                            fullWidth
                            label="Proposal Cost"
                            value={proposalCost}
                            onKeyDown={e => e.stopPropagation()}
                            onChange={(event) => setProposalCost(event.target.value)}
                            type="number"
                            required
                        />

                        <LoadingButton loading={loading} type="submit" variant="contained" color="primary">
                            Submit
                        </LoadingButton>
                        <ErrorDialog open={error} onClose={() => setError(false)} message={errorMessage}/>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
