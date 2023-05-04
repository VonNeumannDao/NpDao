import * as React from "react";
import {useEffect} from "react";
import TopBar from "./components/TopBar";
import {useCanister, useConnect} from "@connect2ic/react";
import {Route, Routes} from 'react-router-dom';
import Home from "./components/Home";
import ProposalFetcher from "./components/ProposalFetcher";
import AdminOnly from "./components/AdminOnly";
import UploadCard from "./components/UploadCard";
import NonProfitDAOPage from "./components/NonProfitDAOPage";
import {Container} from "@mui/material";
import UtilityBar from "./components/UtilityBar";
import Staking from "./components/Staking";
import ConnectWalletMessage from "./components/ConnectWalletMessage";
import TransactionTable from "./components/TransactionTable";
import TokenSnapshotButton from "./components/TokenSnapshotButton";
import DrainICPButton from "./components/DrainICPButton";
import CustodianActions from "./components/CustodianActions";
import {_SERVICE} from "./declarations/token/token.did";
import DistributionXTC from "./components/DistributionXTC";

const Main = () => {
    const {isConnected, principal, disconnect, activeProvider} = useConnect();
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    useEffect(() => {
        if (isConnected && !principal) {
            disconnect();
        }
        console.log("starting in "  +process.env.NODE_ENV)
        console.log("using network "  +process.env.DFX_NETWORK)

    }, [isConnected, principal]);


    return (<>
        <TopBar/>
        <UtilityBar/>
        {!isConnected && <ConnectWalletMessage/>}

        {isConnected && principal && <>
            <Container style={{display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'left'}}>

                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/proposals/:id" element={<ProposalFetcher/>}/>
                    <Route path="/about" element={<NonProfitDAOPage/>}/>
                    <Route path="/distribution" element={<DistributionXTC/>}/>
                    <Route path="/staking" element={<Staking/>}/>
                    <Route path="/transactions" element={<TransactionTable/>}/>
                    <Route path="/admin" element={
                        <AdminOnly>
                            <>
                                <UploadCard/>
                                <TokenSnapshotButton/>
                                <DrainICPButton/>
                                <CustodianActions tableTitle={"Custodian"}
                                                  addFunc={(principal) => tokenActor.addCustodian([principal])}
                                                  removeFunc={(principal) => tokenActor.removeCustodian([principal])}

                                />
                                <CustodianActions tableTitle={"Deployers"}
                                                  addFunc={(principal) => tokenActor.addDeployer([principal])}
                                                  removeFunc={(principal) => tokenActor.removeDeployer([principal])}
                                                  />
                            </>
                        </AdminOnly>
                    }/>
                    <Route path="*" element={<div>Not found</div>}/>
                </Routes>
            </Container>
        </>
        }
    </>);
};

export default Main;
