import {useEffect, useState} from "react";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";

interface AdminOnlyProps {
    children: JSX.Element;
}

function AdminOnly({ children }: AdminOnlyProps) {
    const {principal, isConnected} = useConnect();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const init = async () => {
        if (principal && isConnected) {
            const custodins = await tokenActor.getCustodians();
            const isAdmin = principal && custodins.includes(principal);
            setIsAdmin(isAdmin);
        } else {
            setIsAdmin(false);
        }
    };
    useEffect(() => {
        init();
    }, [principal, isConnected]);

    // Check if the user is an admin

    return isAdmin ? children : null;
}

export default AdminOnly;
