import React from 'react';
import ActiveProposal from "./ActiveProposal";
import ProposalList from "./ProposalList";
import BalanceList from "./BalanceList";

export default function Home() {
    return (
        <div>
            <ActiveProposal/>
            <ProposalList/>
        </div>
    );
}