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

const Main = () => {
    const {isConnected} = useConnect();

    return (<>
        <TopBar/>
        {isConnected && <>
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
        </>
        }
    </>);
};

export default Main;
