import { Button, Card, CardContent, CardHeader } from '@mui/material';
import React, { useState } from 'react';
import { useCanister } from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";
import {JSON_BIGINT} from "../util/josnutil";

export default function DrainICPButton() {
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [isLoading, setIsLoading] = useState(false);

    const handleDrainICPClick = async () => {
        setIsLoading(true);
        try {
            const x = await tokenActor.drainICP();
            console.log(JSON_BIGINT(x));
            setIsLoading(false);
        } catch (error) {
            console.error('Error draining ICP:', error);
            setIsLoading(false);
        }
    };

    return (
        <Card style={{ marginTop: '20px' }}>
            <CardHeader title="Drain ICP" />
            <CardContent>
                <Button variant="contained" disabled={isLoading} onClick={handleDrainICPClick}>
                    {isLoading ? 'Draining...' : 'Drain ICP'}
                </Button>
            </CardContent>
        </Card>
    );
}
