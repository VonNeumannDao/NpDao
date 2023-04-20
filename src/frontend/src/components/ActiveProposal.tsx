import React, {useEffect, useState} from 'react';
import ProposalView from './ProposalView';
import {useCanister} from "@connect2ic/react";
import {_SERVICE, ProposalViewResponse} from "../declarations/icrc_1/icrc_1.did";
import {Button, Container, Divider, Typography} from "@mui/material";
import Voting from "./Voting";
import DebugOnly from "./DebugOnly";

export default function ActiveProposal() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [activeProposal, setActiveProposal] = useState<ProposalViewResponse>();


    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        const activeProposal = await tokenActor.activeProposal();
        setActiveProposal(activeProposal["Ok"])
    }

    async function executeProposalDebug() {
        await tokenActor.executeProposal();
    }

    return (
        <Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {activeProposal && <>
                <DebugOnly>
                    <Button onClick={executeProposalDebug}>Execute</Button>
                </DebugOnly>
                <Typography variant="h4" gutterBottom>Active Proposal</Typography>
                <ProposalView proposal={activeProposal}/>
                <Voting proposalId={activeProposal.id}/>
                <Divider/>
            </>}
        </Container>
    );
}
