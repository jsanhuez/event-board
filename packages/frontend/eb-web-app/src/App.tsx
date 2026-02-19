import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from "@mui/material";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Try to load token from session storage or check refresh token
    const storedToken = sessionStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    Cookies.remove("refreshToken");
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ token, setToken }}>
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Event Board
                </Typography>
                {isLoggedIn && (
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
              </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      isLoggedIn ? (
                        <Navigate to="/events" />
                      ) : (
                        <UsersApp setIsLoggedIn={setIsLoggedIn} />
                      )
                    }
                  />
                  <Route path="/events" element={<EventsApp />} />
                  <Route path="/" element={<Navigate to="/events" />} />
                </Routes>
              </Suspense>
            </Container>
          </Box>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
