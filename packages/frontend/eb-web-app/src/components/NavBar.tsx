import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Event as EventIcon,
} from "@mui/icons-material";

interface NavBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  isLoggedIn = false,
  onLogout,
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo/Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
          }}
        >
          <EventIcon sx={{ mr: 1 }} />
          EventBoard
        </Typography>

        {/* show login or logout button depending on auth state */}
        {isLoggedIn && onLogout ? (
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            startIcon={<LoginIcon />}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
