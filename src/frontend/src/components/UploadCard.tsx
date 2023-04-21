import React, {useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, TextField} from "@mui/material";
import {useCanister} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";

function UploadCard() {
    const [file, setFile] = useState<Uint8Array>(null);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [isLoadingWasm, setIsLoadingWasm] = useState(false); // add state variable for loading screen

    const handleBlobChange = (event, setWasm) => {
        setIsLoadingWasm(true); // set the isLoadingWasm state variable to true
        const wasmFile = event.target.files[0];
        if (wasmFile) {
            const reader = new FileReader();
            reader.onload = () => {
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
    const handleSubmit = async () => {
        if (file) {
            await tokenActor.installDrainCanister(Array.from(file));
            console.log("uploaded")
        }
    };

    return (
        <Card>
            <CardHeader title="Upload a canister drain wasm" />
            <CardContent>
                <TextField
                    type="file"
                    variant="outlined"
                    onChange={(e) => handleBlobChange(e, setFile)}
                />
            </CardContent>
            <CardActions>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!file || isLoadingWasm}
                    onClick={handleSubmit}
                >
                    Upload
                </Button>
            </CardActions>
        </Card>
    );
}

export default UploadCard;
