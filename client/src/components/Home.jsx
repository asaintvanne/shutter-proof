import useEth from "../contexts/EthContext/useEth";
import Register from "./Register";
import RegisteredZone from "./RegisteredZone";
import { useApp } from "../contexts/AppContext";
import { useEffect, useState } from "react";

export const Home = ()  => {
  const { state: {artifact, contract, accounts} } = useEth();
  const { state: {isRegistered}} = useApp();

  const [isUserRegistered, setUserRegistered] = useState(isRegistered);

  useEffect(() => {
    setUserRegistered(isRegistered);
  }, [isRegistered, accounts]);

  const NotConnectedComponent = () => {
    return (
      <>
        <div id="not_connected">
          <img src="logo_carre_shutterproof.png" alt="Logo de ShutterProof" />
          <br />
          Veuillez configurer votre wallet de sorte à accéder à ShutterProof.
        </div>
      </>
    );
  };
   
  return (
    <div>
      {
        !artifact || !contract ? <NotConnectedComponent /> : isUserRegistered ? <RegisteredZone /> : <Register />
      }
    </div>
  );
}
