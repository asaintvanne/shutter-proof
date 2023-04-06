const actions = {
    init: "INIT",
    registration: "REGISTRATION"
  };
  
  const initialState = {
    isRegitered: null,
    role: null
  };
  
  const reducer = (state, action) => {
    const { type, data } = action;
    switch (type) {
      case actions.init:
        return { ...state, ...data };
    case actions.registration:
        return { ...state, isRegistered: data };
      default:
        throw new Error("Undefined reducer action type");
    }
  };
  
  export { actions, initialState, reducer };
  