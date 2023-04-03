import React, { useReducer, useEffect } from "react";
import useEth from '../EthContext/useEth';
import AppContext from "./AppContext";
import { reducer, actions, initialState } from "./state";

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {state: { contract, accounts }} = useEth();

  const init =
    async () => {
      if (contract) {
        contract.methods.isRegistered().call({ from: accounts[0] })
          .then(isRegistered => {
            console.log('IS REGISTERED ' + isRegistered);
            dispatch({
              type: actions.init,
              data: { isRegistered: isRegistered }
            });
          })
          .catch(error => {
            dispatch({
              type: actions.init,
              data: { isRegistered: false }
            });
          });
      }
    };

  useEffect(() => {
    init();
  }, [contract, accounts]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
