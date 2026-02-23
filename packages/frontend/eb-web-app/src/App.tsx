import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Box, Container } from "@mui/material";
import { NavBar } from "./components/NavBar";
import Cookies from "js-cookie";
import { AuthContext } from "./AuthContext";

const UsersApp = lazy(() =>
  import("@ebWebAppUsers/UsersApp").catch(() => ({
    default: () => <div>Failed to load Users module</div>,
  })),
);
const EventsApp = lazy(() =>
  import("@ebWebAppEvents/EventsApp").catch(() => ({
    default: () => <div>Failed to load Events module</div>,
  })),
);

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // simple JWT decoder for payload
  const parseJwt = (tk: string) => {
    try {
      const base64 = tk.split(".")[1];
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Try to load token from session storage or check refresh token
    const storedToken = sessionStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      const payload = parseJwt(storedToken);
      console.log("Parsed JWT payload:", payload);
      console.log("Parsed JWT payload:", JSON.stringify(payload)); // Debugging line to check payload
      if (payload && typeof payload.name === "string") {
        setUserName(payload.name);
      }
    }
  }, []);

  // whenever token changes (including after login), keep userName in sync
  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload && typeof payload.name === "string") {
        setUserName(payload.name);
      }
    } else {
      setUserName(null);
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    Cookies.remove("refreshToken");
    setToken(null);
    setUserName(null);
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ token, setToken, userName, setUserName }}>
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

            <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      isLoggedIn ? (
                        <Navigate to="/" />
                      ) : (
                        <UsersApp
                          setIsLoggedIn={setIsLoggedIn}
                          setToken={setToken}
                          setUserName={setUserName}
                        />
                      )
                    }
                  />
                  <Route path="/" element={<EventsApp />} />
                </Routes>
              </Suspense>
            </Container>
          </Box>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
