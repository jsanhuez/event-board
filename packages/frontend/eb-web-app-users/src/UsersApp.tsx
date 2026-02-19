import React, { useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { AuthContext } from './AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface UsersAppProps {
  setIsLoggedIn?: (value: boolean) => void;
}

export default function UsersApp({ setIsLoggedIn }: UsersAppProps) {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const authContext = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const mutation = `
      mutation {
        login(input: { email: "${loginEmail}", password: "${loginPassword}" }) {
          accessToken
          refreshToken
          user {
            id
            email
            name
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_GATEWAY_URL ||
          "http://localhost:4000/graphql",
        { query: mutation },
      );

      if (response.data.errors) {
        setError(response.data.errors[0].message);
        return;
      }

      const { accessToken, refreshToken } = response.data.data.login;
      sessionStorage.setItem("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      if (authContext) {
        authContext.setToken(accessToken);
      }

      setSuccessMessage("Login successful!");
      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }

      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const mutation = `
      mutation {
        register(input: { email: "${registerEmail}", name: "${registerName}", password: "${registerPassword}" }) {
          accessToken
          refreshToken
          user {
            id
            email
            name
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_GATEWAY_URL ||
          "http://localhost:4000/graphql",
        { query: mutation },
      );

      if (response.data.errors) {
        setError(response.data.errors[0].message);
        return;
      }

      const { accessToken, refreshToken } = response.data.data.register;
      sessionStorage.setItem("accessToken", accessToken);
      Cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });

      if (authContext) {
        authContext.setToken(accessToken);
      }

      setSuccessMessage("Registration successful!");
      if (setIsLoggedIn) {
        setIsLoggedIn(true);
      }

      setRegisterEmail("");
      setRegisterName("");
      setRegisterPassword("");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 500 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Authentication
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="auth tabs"
            sx={{ mb: 3 }}
          >
            <Tab
              label="Login"
              id="auth-tab-0"
              aria-controls="auth-tabpanel-0"
            />
            <Tab
              label="Register"
              id="auth-tab-1"
              aria-controls="auth-tabpanel-1"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" fullWidth>
                  Login
                </Button>
              </Stack>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" fullWidth>
                  Register
                </Button>
              </Stack>
            </form>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
