import React, {useEffect, useState} from "react";
import ProposalView from "./ProposalView";
import {useCanister} from "@connect2ic/react";
import {_SERVICE, ProposalViewResponse} from "../declarations/token/token.did";
import {useNavigate, useParams} from "react-router-dom";
import {Avatar, Card, CardContent, CardHeader, IconButton} from "@mui/material";
import {EmojiPeopleRounded} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

function ProposalFetcher() {
    const {id} = useParams();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [proposal, setProposal] = useState<ProposalViewResponse>();
    const navigate = useNavigate();
    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        const proposals = await tokenActor.pastProposals();
        setProposal(proposals.find(x => x.id === BigInt(id)));
    }



    return (<>
            {proposal && <>
                <Card sx={{ marginTop: '16px' }}>
                    <CardHeader
                        titleTypographyProps={{ variant: 'h4' }}
                        color={'secondary'}
                        avatar={
                            <Avatar>
                                <EmojiPeopleRounded />
                            </Avatar>
                        }
                        title={"Proposal Details"}
                        action={
                            <IconButton onClick={() => navigate(-1)}>
                                <CloseIcon />
                            </IconButton>
                        }
                    />
                    <CardContent>
                        <ProposalView proposal={proposal} />
                    </CardContent>
                </Card>
            </> }

        </>
    );
}

export default ProposalFetcher;
