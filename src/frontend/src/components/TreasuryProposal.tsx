import React, {useState} from 'react';
import {Box, Card, CardHeader, InputAdornment, styled, TextField} from "@mui/material";
import config from "../../../../cig-config.json";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import LoadingButton from "@mui/lab/LoadingButton";
import {Principal} from "@dfinity/principal";
import ErrorDialog from "./ErrorDialog";
import {convertToBigInt} from "../util/bigintutils";
import {Navigate} from "react-router-dom";

const Form = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: "700px"
});

function TreasuryProposal() {
    const {principal} = useConnect();

    const [description, setDescription] = useState('');
    const [error, setError] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [title, setTitle] = useState('');
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState('');
    const receiverRegex = /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    const noSpecialCharsRegex = /^[a-zA-Z0-9\s]*$/;
    const urlSafeNoCodeRegex = /^[\w\s.,!?'’’"\(\)-]*$/;
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await tokenActor.createTreasuryProposal({
            owner: Principal.fromText(principal),
            subaccount: []
        }, description, title, {
            owner: Principal.fromText(receiver),
            subaccount: []
        }, convertToBigInt(amount));

        if ("Err" in response) {
            setError(true);
            setErrorMessage(JSON.stringify(response["Err"], (_, v) => typeof v === 'bigint' ? `${v}n` : v));
        } else {
            window.location.href = "/";
        }

        setLoading(false);
    };

    return (
        <Card sx={{padding: 2}}>
            <CardHeader title="Treasury Proposal"  />
            <form onSubmit={handleSubmit} style={{padding: 1}} >
                <Box display={"flex"} flexDirection={"column"} sx={{ gap: 3 , minWidth: "400px"}}>
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    onKeyDown={e => e.stopPropagation()}
                    error={!noSpecialCharsRegex.test(title)}
                    helperText={
                        !noSpecialCharsRegex.test(title)
                            ? 'Please enter a title without special characters.'
                            : ''
                    }
                />

                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                    required
                    multiline
                    rows={10} // Set the number of rows to fit the story
                    error={!urlSafeNoCodeRegex.test(description)}
                    helperText={
                        (!urlSafeNoCodeRegex.test(description))
                            ? 'Please enter a human-readable, URL-safe description without code.'
                            : ''
                    }
                />

                <TextField
                    fullWidth
                    label="Receiver Principal"
                    value={receiver}
                    onKeyDown={e => e.stopPropagation()}
                    onChange={(event) => setReceiver(event.target.value)}
                    required
                    error={!receiverRegex.test(receiver)}
                    helperText={
                        !receiverRegex.test(receiver) ? 'Please enter a valid receiver.' : ''
                    }
                />

                <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onKeyDown={e => e.stopPropagation()}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                    InputProps={{
                        endAdornment: <InputAdornment position="end">${config.symbol}</InputAdornment>,
                    }}
                />

                <LoadingButton loading={loading} fullWidth type="submit" variant="contained" color="primary">
                    Submit
                </LoadingButton>
                {submitted && <Navigate to="/" state={submitted} replace={true} />}
                <ErrorDialog open={error} onClose={() => setError(false)} message={errorMessage}/>
                </Box>
            </form>
        </Card>
    );
}

export default TreasuryProposal;
