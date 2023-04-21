import {useContext, useEffect, useState} from "react";
import {useConnect} from "@connect2ic/react";

interface AdminOnlyProps {
    children: JSX.Element;
}

function AdminOnly({ children }: AdminOnlyProps) {
    const {principal} = useConnect();

    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (principal) {
            const isAdmin = principal && principal === "bccux-unsg4-wmiio-tnimk-hmgtj-7zwoa-p7oxs-oc5ks-7btcc-tlfcq-zae";
            setIsAdmin(isAdmin);
        }
    }, [principal]);

    // Check if the user is an admin

    return isAdmin ? children : null;
}

export default AdminOnly;
