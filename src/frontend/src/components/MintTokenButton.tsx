import React, {useState} from 'react';
import LoadingButton from "@mui/lab/LoadingButton";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";
import {Principal} from "@dfinity/principal";
import {useAppContext} from "./AppContext";

const MintTokenButton = () => {
    const {principal} = useConnect();
    const {setBalanceVal, balancePretty} = useAppContext();


    const [loading, setLoading] = useState(false);
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const handleClick = async () => {
        setLoading(true);
        const minting = await tokenActor.mint_tokens();
        console.log(minting);
        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        });
        console.log(balance)
        setBalanceVal(balance);
        setLoading(false);
    };

    return (
        <>
            <LoadingButton sx={{marginLeft: 2}} loading={loading} onClick={handleClick} variant='contained'
                           color='warning'>Mint</LoadingButton>
        </>
    );
};

export default MintTokenButton;