import { useState } from 'react';
import useEth from "../contexts/EthContext/useEth";
import useApp from "../contexts/AppContext/useApp";
import * as Roles from "../roles.js";
import AccountInfo from './AccountInfo.jsx';
import { actions } from '../contexts/AppContext';
import { toast } from 'react-toastify';

function Register() {

  const { state: { contract, accounts, web3 } } = useEth();
  const { dispatch } = useApp();

    const [name, setName] = useState("");
    const [siret, setSiret] = useState("");
    const [role, setRole] = useState("");

    const handleSiretChange = e => {
      if (/^\d+$|^$/.test(e.target.value) && e.target.value.length < 15) {
        setSiret(e.target.value);
      }
    };

    const register = e => {
      if (name !== "" && siret !== "" && role !== "") {
        const transformedSiret = web3.utils.padRight(web3.utils.fromAscii(siret), 14)
        contract.methods.register(name, transformedSiret, role).call({ from: accounts[0] })
          .then(response => {
            return contract.methods.register(name, transformedSiret, role).send({ from: accounts[0] })
          })
          .then(isRegistered => {
            dispatch({ type: actions.registration, data: isRegistered });
            toast.success("Vous êtes désormais insrit sur ShutterProof", {
              position: toast.POSITION.TOP_LEFT
            });
          })
          .catch(error => {
            toast.error("Vous êtes désormais enregistré sur ShutterProof", {
              position: toast.POSITION.TOP_LEFT
            });
          })
        ;
      } else {
        toast.warning("Tous les champs doivent être correctement renseignés", {
          position: toast.POSITION.TOP_LEFT
        });
      }
    };

    return (
        <>
            <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <AccountInfo />
            </nav>

            <main role="main" className="container">
                <div className="jumbotron">
                    <div className="row">
                        <div className="col">
                            <input className="input-big" type="text" placeholder="Nom" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <input className="input-big" type="text" placeholder="SIRET" required value={siret} onChange={handleSiretChange} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <select className="input-big" onChange={(e) => setRole(e.target.value)}>
                                <option value="">Sélectionner un role</option>
                                <option value={Roles.Photographer}>{Roles.getRole(Roles.Photographer)}</option>
                                <option value={Roles.Client}>{Roles.getRole(Roles.Client)}</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                        <button onClick={register} className="btn btn-primary mt-1 btn-register">S'enregistrer</button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Register