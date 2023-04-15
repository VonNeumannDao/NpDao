import * as React from "react";
import TopBar from "./components/TopBar";
import MintTokens from "./components/MintTokens";
import {useConnect} from "@connect2ic/react";
import Comment from "./components/Comment";

const Main = () => {
  const {isConnected} = useConnect();

  return (<>
    <TopBar/>
    {isConnected && <>
        <MintTokens/>
        <Comment/>
    </>
    }
  </>);
};

export default Main;
