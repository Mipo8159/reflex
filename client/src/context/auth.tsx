import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { User } from '../types';
import Axios from 'axios';

interface State {
  authenticated: boolean;
  user: User | undefined;
  loading: boolean;
}
interface Action {
  type: string;
  payload: any;
}

//--> State & Dispatch contexts
const stateContext = createContext<State>({
  authenticated: false,
  user: null,
  loading: true,
});
const DispatchContext = createContext(null);

//--> Auth reducer
const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'LOGIN':
      return { ...state, authenticated: true, user: payload };
    case 'LOGOUT':
      return { ...state, authenticated: false, user: null };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      throw Error(`Unknown action type ${type}`);
  }
};

//--> whote Provider for _app.tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, defaultDispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
    loading: true,
  });

  const dispatch = (type: string, payload?: any) =>
    defaultDispatch({ type, payload });

  useEffect(() => {
    Axios.get('/auth/accessToken')
      .then((res) => dispatch('LOGIN', res.data))
      .catch((err) => console.log(err))
      .finally(() => dispatch('STOP_LOADING'));
  }, []);

  return (
    <DispatchContext.Provider value={dispatch}>
      <stateContext.Provider value={state}>{children}</stateContext.Provider>
    </DispatchContext.Provider>
  );
};

//--> our Auth hooks
export const useAuthState = () => useContext(stateContext);
export const useAuthDispatch = () => useContext(DispatchContext);
