import React, {useEffect, useState} from 'react';
import ProposalView from './ProposalView';
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {ProposalType, ProposalViewResponse} from "../declarations/icrc_1/icrc_1.did";
import {Container, Divider, Typography} from "@mui/material";
import Voting from "./Voting";

export default function ActiveProposal() {
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [activeProposal, setActiveProposal] = useState<ProposalViewResponse>();


    useEffect(() => {
        init().then();
    }, []);
    async function init(){
        const activeProposal = await tokenActor.activeProposal();
        setActiveProposal(activeProposal["Ok"])
    }
    return (
        <Container>{activeProposal && <>
            <Typography variant="h4" gutterBottom>Active Proposal</Typography>
            <ProposalView proposal={activeProposal} />
            <Voting proposalId={activeProposal.id} />
            <Divider />
        </>}
        </Container>
    );
}
