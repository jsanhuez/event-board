import React from "react";

export const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
} | null>(null);
