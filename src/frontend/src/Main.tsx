import * as React from "react";
import TopBar from "./components/TopBar";
import {useConnect} from "@connect2ic/react";
import {Route, Routes} from 'react-router-dom';
import Home from "./components/Home";
import ProposalFetcher from "./components/ProposalFetcher";
import AdminOnly from "./components/AdminOnly";
import UploadCard from "./components/UploadCard";
import NonProfitDAOPage from "./components/NonProfitDAOPage";
import NonProfitDonation from "./components/NonProfitDonation";
import {Container} from "@mui/material";
import BalanceList from "./components/BalanceList";

const Main = () => {
    const {isConnected, principal} = useConnect();

    return (<>
        <TopBar/>
        <BalanceList/>
        {isConnected && principal && <>
            <Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'left' }}>

            <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/proposals/:id" element={<ProposalFetcher/>}/>
                    <Route path="/about" element={<NonProfitDAOPage/>}/>
                    <Route path="/distribution" element={<NonProfitDonation/>}/>
                    <Route path="/admin" element={
                        <AdminOnly>
                            <UploadCard/>
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
