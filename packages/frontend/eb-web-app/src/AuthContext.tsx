import React from "react";

export const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
}>({
  token: null,
  setToken: () => {},
  userName: null,
  setUserName: () => {},
});
