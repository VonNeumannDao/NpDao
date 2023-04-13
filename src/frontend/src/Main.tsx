import * as React from "react";
import TopBar from "./components/TopBar";
import DonateCard from "./components/DonateCard";
import {useConnect} from "@connect2ic/react";
import Comment from "./components/Comment";

const Main = () => {
  const {isConnected} = useConnect();

  return (<>
    <TopBar/>
    {isConnected && <>
        <DonateCard/>
        <Comment/>
    </>
    }
  </>);
};

export default Main;
