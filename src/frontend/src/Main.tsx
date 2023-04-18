import * as React from "react";
import TopBar from "./components/TopBar";
import {useConnect} from "@connect2ic/react";
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';
import Home from "./components/Home";
import ProposalFetcher from "./components/ProposalFetcher";

const Main = () => {
  const {isConnected} = useConnect();

  return (<>
    <TopBar/>
    {isConnected && <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/proposals/:id" element={<ProposalFetcher/>} />
        </Routes>
      </Router>
    </>
    }
  </>);
};

export default Main;
