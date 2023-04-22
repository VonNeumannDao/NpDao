import React, {useEffect, useState} from 'react';
import ProposalView from './ProposalView';
import {useCanister} from "@connect2ic/react";
import {_SERVICE, ProposalViewResponse} from "../declarations/icrc_1/icrc_1.did";
import {Button, CardHeader, Container, Divider, Typography, CardContent, Card, Avatar, IconButton} from "@mui/material";
import Voting from "./Voting";
import DebugOnly from "./DebugOnly";
import EmptyProposalsCard from "./EmptyProposalsCard";
import {DescriptionRounded, EmojiPeopleRounded} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

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

    return (
        <>
            {activeProposal && <>
                <Card sx={{ marginTop: 1 }}>
                    <CardHeader
                        titleTypographyProps={{ variant: 'h4' }}
                        color={'secondary'}
                        avatar={
                            <Avatar>
                                <EmojiPeopleRounded />
                            </Avatar>
                        }
                        title="Active Proposal"
                    />
                    <CardContent>
                        <ProposalView proposal={activeProposal}/>
                        <Voting proposalId={activeProposal.id}/>
                    </CardContent>
                </Card>
            </>}
            {!activeProposal && <EmptyProposalsCard/>}
        </>
    );
}
