import {useEffect, useState} from "react";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE} from "../declarations/token/token.did";

interface DeployerOnlyProps {
    children: JSX.Element;
}

function DeployerOnly({ children }: DeployerOnlyProps) {
    const {principal, isConnected} = useConnect();

    const [isDeployer, setIsDeployer] = useState<boolean>(false);
    const [_tokenActor] = useCanister("token");
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const init = async () => {
        console.log(principal, isConnected)
        if (principal && isConnected) {
            const [deployers, custodian] = await Promise.all([
                tokenActor.getDeployers(),
                tokenActor.getCustodians()
            ]);
            const isDeployer = principal && (deployers.includes(principal) || custodian.includes(principal));
            setIsDeployer(isDeployer);
        } else {
            setIsDeployer(false);
        }
    };
    useEffect(() => {
        init();
    }, [principal, isConnected]);

    // Check if the user is a deployer

    return isDeployer ? children : null;
}

export default DeployerOnly;
