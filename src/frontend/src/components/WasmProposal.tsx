import React, {useEffect, useState} from 'react';
import {Box, Card, CardHeader, InputLabel, MenuItem, Select, styled, TextField} from "@mui/material";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import LoadingButton from "@mui/lab/LoadingButton";
import ErrorDialog from "./ErrorDialog";
import {Principal} from "@dfinity/principal";
import {useNavigate} from "react-router-dom";
import {generateUUID} from "../util/bigintutils";

const Form = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: "700px"
});

export default function WasmProposal() {
    const {principal} = useConnect();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [canisters, setCanisters] = useState<Map<string, string>>(new Map());
    const [title, setTitle] = useState('');
    const [appName, setAppName] = useState('');
    const navigate = useNavigate();

    const [wasmBlob, setWasmBlob] = useState<Uint8Array>(null); // add state variable for wasm blob
    const [argsBlob, setArgsBlob] = useState<Uint8Array>(null); // add state variable for wasm blob
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
            tokenActor.createWasmProposal(
                {
                    owner: Principal.fromText(principal),
                    subaccount: []
                },
                description,
                title,
                Array.from(wasmBlob),
                argsBlob ? [Array.from(argsBlob)] : [],
                canisterId ? [canisterId] : [],
                appName ? [appName] : [generateUUID()]);

        if ("Err" in response) {
            setError(true);
            setErrorMessage(JSON.stringify(response["Err"], (_, v) => typeof v === 'bigint' ? `${v}n` : v));
        } else {
            window.location.href = "/";
        }

        setLoading(false);
    };

    const handleBlobChange = (event, setWasm) => {
        setIsLoadingWasm(true); // set the isLoadingWasm state variable to true
        console.log("yjsy∂ß")

        const wasmFile = event.target.files[0];
        if (wasmFile) {
            const reader = new FileReader();
            reader.onload = () => {
                console.log("this")
                const wasmArrayBuffer = reader.result;
                console.log(wasmArrayBuffer);
                // @ts-ignore
                setWasm(new Uint8Array(wasmArrayBuffer));
                setIsLoadingWasm(false); // set the isLoadingWasm state variable to false
            };
            reader.readAsArrayBuffer(wasmFile);
        } else {
            setWasm(null);
        }
    };

    return (
        <Card sx={{ p: 5 }}>
            <CardHeader title="Wasm Proposal" />
            <form onSubmit={handleSubmit}>
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
                    required
                    onKeyDown={e => e.stopPropagation()}
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
                    label="Application Name"
                    value={appName}
                    onChange={(event) => setAppName(event.target.value)}
                    required
                    onKeyDown={e => e.stopPropagation()}
                    error={!noSpecialCharsRegex.test(appName)}
                    helperText={
                        !noSpecialCharsRegex.test(appName)
                            ? 'Please enter an app name without special characters.'
                            : ''
                    }
                />

                <TextField
                    fullWidth
                    label="Wasm"
                    type="file"
                    required
                    onKeyDown={e => e.stopPropagation()}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => handleBlobChange(event, setWasmBlob)} // handle change event on wasm file input
                />

                <TextField
                    fullWidth
                    label="Args"
                    onKeyDown={e => e.stopPropagation()}
                    type="file"
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => handleBlobChange(event, setArgsBlob)} // handle change event on wasm file input
                />

                <InputLabel htmlFor="my-select" shrink={false} id="my-select-label">CanisterId to Update</InputLabel>
                <Select
                    labelId="my-select-label"
                    id="my-select"
                    value={canisterId}
                    onChange={handleCanisterIdChange}
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
