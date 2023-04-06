import { useEth } from "../contexts/EthContext";
import { addressCut } from "../libs/address_cut.js"

export default function AccountInfo() {
  const { state: { accounts} } = useEth();
   
  return(
    <div className="text-white">
      Connecté sur {accounts?.length > 0 ? addressCut(accounts[0]) : ""}
    </div>
  );
};