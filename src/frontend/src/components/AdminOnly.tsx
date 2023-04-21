import {useContext, useEffect, useState} from "react";
import {useConnect} from "@connect2ic/react";
import config from "../../../../cig-config.json";

interface AdminOnlyProps {
    children: JSX.Element;
}

function AdminOnly({ children }: AdminOnlyProps) {
    const {principal, isConnected} = useConnect();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (principal && isConnected) {
            const isAdmin = principal && config.custodian.includes(principal) ;
            setIsAdmin(isAdmin);
        } else {
            setIsAdmin(false);
        }
    }, [principal, isConnected]);

    // Check if the user is an admin

    return isAdmin ? children : null;
}

export default AdminOnly;
