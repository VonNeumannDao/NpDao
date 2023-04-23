import React, {useEffect, useState} from 'react';
import {Box, Card, CardHeader, InputLabel, MenuItem, Select, styled, TextField, Typography} from "@mui/material";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorDialog from "./ErrorDialog";
import {Principal} from "@dfinity/principal";
import {useNavigate} from "react-router-dom";

const Form = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: "700px"
});

export default function DeleteWasmProposal() {
    const {principal} = useConnect();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [canisters, setCanisters] = useState<Map<string, string>>(new Map());
    const [title, setTitle] = useState('');
    const navigate = useNavigate();
    const [canisterId, setCanisterId] = useState('');

    const handleCanisterIdChange = (event) => {
        setCanisterId(event.target.value);
    };
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const noSpecialCharsRegex = /^[a-zA-Z0-9\s]*$/;
    const urlSafeNoCodeRegex = /^[\w\s.,!?'’’"\(\)-]*$/;
    const [isLoadingWasm, setIsLoadingWasm] = useState(false); // add state variable for loading screen

    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        const canisters = await tokenActor.canisters();
        const map = new Map<string, string>();
        for (let canister of canisters) {
            map.set(canister.canisterId, canister.appName);
        }
        setCanisters(map);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await
            tokenActor.createDeleteWasmProposal(
                {
                    owner: Principal.fromText(principal),
                    subaccount: []
                },
                description,
                title,
                canisterId);

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
            <CardHeader title="Delete Canister Proposal" />
            <form onSubmit={handleSubmit}>
                <Box display={"flex"} flexDirection={"column"} sx={{ gap: 3 , minWidth: "400px"}}>

                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onKeyDown={e => e.stopPropagation()}
                    onChange={(event) => setTitle(event.target.value)}
                    required
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
                    onKeyDown={e => e.stopPropagation()}
                    onChange={(event) => setDescription(event.target.value)}
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

                <InputLabel htmlFor="my-select" shrink={false} id="my-select-label">CanisterId to Update</InputLabel>
                <Select
                    labelId="my-select-label"
                    id="my-select"
                    value={canisterId}
                    onChange={handleCanisterIdChange}
                    required={true}
                >
                    <MenuItem value=""><em>None</em></MenuItem>

                    {Array.from(canisters.keys()).map((x) =>
                        <MenuItem key={x} value={x}>{canisters.get(x)}</MenuItem>
                    )}
                </Select>

                <LoadingButton loading={loading || isLoadingWasm} fullWidth type="submit" variant="contained" color="primary">
                    Submit
                </LoadingButton>
                <ErrorDialog open={error} onClose={() => setError(false)} message={errorMessage} />
                </Box>
            </form>
        </Card>
    );
}
