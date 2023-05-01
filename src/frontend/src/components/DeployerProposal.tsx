import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@mui/material';
import {LoadingButton} from "@mui/lab";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {Principal} from "@dfinity/principal";
import {convertToBigInt} from "../util/bigintutils";
import ErrorDialog from "./ErrorDialog";

export default function DeployerProposal() {
    const {principal} = useConnect();
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [deployer, setDeployer] = useState('');
    const [add, setAdd] = useState(true);
    const deployerRegex = /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/;
    const noSpecialCharsRegex = /^[a-zA-Z0-9\s]*$/;
    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await tokenActor.createDeployerProposal({
            owner: Principal.fromText(principal),
            subaccount: []
        }, description, title, deployer, add);
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
            <CardHeader title="Deployer Proposal" />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Box display={"flex"} flexDirection={"column"} sx={{ gap: 3 , minWidth: "400px"}}>
                        <TextField
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
                            label="Description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            required
                            multiline
                            rows={5}
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
                            label="Deployer Principal"
                            value={deployer}
                            onKeyDown={e => e.stopPropagation()}
                            onChange={(event) => setDeployer(event.target.value)}
                            required
                            error={!deployerRegex.test(deployer)}
                            helperText={
                                !deployerRegex.test(deployer) ? 'Please enter a valid deployer.' : ''
                            }
                        />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Action
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <FormControlLabel control={<Radio checked={add} onChange={(event) => setAdd(event.target.checked)} />} label="Add" />
                                <FormControlLabel control={<Radio checked={!add} onChange={(event) => setAdd(!event.target.checked)} />} label="Remove" />
                            </Box>
                        </Box>
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
