import React, {useEffect, useState} from "react";
import ProposalView from "./ProposalView";
import {useCanister} from "@connect2ic/react";
import {_SERVICE, ProposalViewResponse} from "../declarations/icrc_1/icrc_1.did";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Toolbar} from "@mui/material";

function ProposalFetcher() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const [proposal, setProposal] = useState<ProposalViewResponse>();

    useEffect(() => {
        init().then();
    }, []);

    async function init() {
        const proposals = await tokenActor.pastProposals();
        setProposal(proposals.find(x => x.id === BigInt(id)));
    }

    const handleBackClick = () => {
        navigate(-1);
    };

    return (<>
            <Toolbar>
                <Button onClick={handleBackClick}>Back</Button>
            </Toolbar>
            {proposal && <ProposalView proposal={proposal}/>}
        </>
    );
}

export default ProposalFetcher;
