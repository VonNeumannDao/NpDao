import React, {createContext, useState, useContext, useEffect} from 'react';
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import {Principal} from "@dfinity/principal";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/icrc_1/icrc_1.did";

interface AppContextType {
    balance: bigint;
    balancePretty: string;
    setBalanceVal: (balance: bigint) => void
}

const AppContext = createContext<AppContextType>({
    balance: 0n,
    balancePretty: "0",
    setBalanceVal: (balance: bigint) => {}
});

const AppProvider: React.FC = (param: { children }) => {
    const [balance, setBalance] = useState<bigint>(0n);
    const [balancePretty, setBalancePretty] = useState<string>("0");
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {principal} = useConnect();

    useEffect(() => {
        if(principal)
        init().then();
    }, [principal]);
    async function init(){
        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        });
        setBalanceVal(balance);
    }
    const setBalanceVal = (balance: bigint) => {
        setBalance(balance);
        setBalancePretty(bigIntToDecimalPrettyString(balance))
    }

    const state: AppContextType = {
        balance,
        balancePretty,
        setBalanceVal
    };

    return (
        <AppContext.Provider value={state}>
            {param.children}
        </AppContext.Provider>
    );
};

const useAppContext = (): AppContextType => useContext(AppContext);

export { AppProvider, useAppContext };