import React from 'react';
import ActiveProposal from "./ActiveProposal";
import ProposalList from "./ProposalList";

export default function Home() {
    return (
        <div>
            <ActiveProposal/>
            <ProposalList/>
        </div>
    );
}