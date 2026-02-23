import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "./AuthContext";

// build-time injected URL or fallback to default
const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:4000/graphql";
console.log(
  "process.env.REACT_APP_API_GATEWAY_URL:",
  process.env.REACT_APP_API_GATEWAY_URL,
);

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  organizer: string;
  status: string;
}

export default function EventsApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "workshop",
    organizer: "",
    status: "draft",
  });

  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });

  const [sortConfig, setSortConfig] = useState<{
    field: "title" | "date" | "location" | "category" | "status";
    direction: "asc" | "desc";
  }>({
    field: "date",
    direction: "asc",
  });

  const authContext = useContext(AuthContext);
  const isAuthenticated = !!(
    sessionStorage.getItem("accessToken") || authContext?.token
  );

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const getAuthHeader = () => {
    const token = sessionStorage.getItem("accessToken") || authContext?.token;
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchEvents = async () => {
    setError(null);

    const filterQuery = Object.entries(filters)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(", ");

    const query = `
      query {
        events${filterQuery ? `(filter: { ${filterQuery} })` : ""} {
          _id
          title
          description
          date
          location
          category
          organizer
          status
        }
      }
    `;

    try {
      const response = await axios.post(
        API_GATEWAY_URL,
        { query },
        { headers: getAuthHeader() },
      );

      if (response.data.errors) {
        setError(response.data.errors[0].message);
        return;
      }

      setEvents(response.data.data.events || []);
    } catch (err) {
      setError("Failed to fetch events. Please try again.");
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingId(event._id);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date.split("T")[0],
        location: event.location,
        category: event.category?.toLowerCase() ?? "workshop",
        organizer: event.organizer,
        status: event.status?.toLowerCase() ?? "draft",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "workshop",
        organizer: "",
        status: "draft",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveEvent = async () => {
    setError(null);

    if (!formData.title || !formData.description || !formData.date) {
      setError("Please fill in all required fields");
      return;
    }

    if (editingId) {
      const mutation = `
        mutation {
          updateEvent(
            id: "${editingId}",
            input: {  
              title: "${formData.title}"
              description: "${formData.description}"
              date: "${formData.date}T00:00:00Z"
              location: "${formData.location}"
              category: ${formData.category.toUpperCase()}
              organizer: "${formData.organizer}"
              status: ${formData.status.toUpperCase()}
            }
          ) {
            _id
            title
            description
            date
            location
            category
            organizer
            status
          }
        }
      `;

      try {
        const response = await axios.post(
          API_GATEWAY_URL,
          { query: mutation },
          { headers: getAuthHeader() },
        );

        if (response.data.errors) {
          setError(response.data.errors[0].message);
          return;
        }

        setSuccessMessage("Event updated successfully!");
        setOpenDialog(false);
        fetchEvents();
      } catch (err) {
        setError("Failed to update event. Please try again.");
      }
    } else {
      const mutation = `
        mutation {
          createEvent(input: {
            title: "${formData.title}"
            description: "${formData.description}"
            date: "${formData.date}T00:00:00Z"
            location: "${formData.location}"
            category: ${formData.category.toUpperCase()}
            organizer: "${formData.organizer}"
            status: ${formData.status.toUpperCase()}
          }) {
            _id
            title
            description
            date
            location
            category
            organizer
            status
          }
        }
      `;

      try {
        const response = await axios.post(
          API_GATEWAY_URL,
          { query: mutation },
          { headers: getAuthHeader() },
        );

        if (response.data.errors) {
          setError(response.data.errors[0].message);
          return;
        }

        setSuccessMessage("Event created successfully!");
        setOpenDialog(false);
        fetchEvents();
      } catch (err) {
        setError("Failed to create event. Please try again.");
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setError(null);
    const mutation = `
      mutation {
        deleteEvent(id: "${id}") {
          _id
        }
      }
    `;

    try {
      const response = await axios.post(
        API_GATEWAY_URL,
        { query: mutation },
        { headers: getAuthHeader() },
      );

      if (response.data.errors) {
        setError(response.data.errors[0].message);
        return;
      }

      setSuccessMessage("Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      setError("Failed to delete event. Please try again.");
    }
  };

  return (
    <Box sx={{ py: 4 }}>
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

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="workshop">Workshop</MenuItem>
            <MenuItem value="meetup">Meetup</MenuItem>
            <MenuItem value="talk">Talk</MenuItem>
            <MenuItem value="social">Social</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        {isAuthenticated && (
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
            sx={{ ml: "auto" }}
          >
            Create Event
          </Button>
        )}
      </Stack>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sortDirection={
                  sortConfig.field === "title" ? sortConfig.direction : false
                }
              >
                <TableSortLabel
                  active={sortConfig.field === "title"}
                  direction={
                    sortConfig.field === "title" ? sortConfig.direction : "asc"
                  }
                  onClick={() =>
                    setSortConfig((prev) => ({
                      field: "title",
                      direction:
                        prev.field === "title" && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  <strong>Title</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortConfig.field === "date" ? sortConfig.direction : false
                }
              >
                <TableSortLabel
                  active={sortConfig.field === "date"}
                  direction={
                    sortConfig.field === "date" ? sortConfig.direction : "asc"
                  }
                  onClick={() =>
                    setSortConfig((prev) => ({
                      field: "date",
                      direction:
                        prev.field === "date" && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  <strong>Date</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortConfig.field === "location" ? sortConfig.direction : false
                }
              >
                <TableSortLabel
                  active={sortConfig.field === "location"}
                  direction={
                    sortConfig.field === "location"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() =>
                    setSortConfig((prev) => ({
                      field: "location",
                      direction:
                        prev.field === "location" && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  <strong>Location</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortConfig.field === "category" ? sortConfig.direction : false
                }
              >
                <TableSortLabel
                  active={sortConfig.field === "category"}
                  direction={
                    sortConfig.field === "category"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() =>
                    setSortConfig((prev) => ({
                      field: "category",
                      direction:
                        prev.field === "category" && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  <strong>Category</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortConfig.field === "status" ? sortConfig.direction : false
                }
              >
                <TableSortLabel
                  active={sortConfig.field === "status"}
                  direction={
                    sortConfig.field === "status" ? sortConfig.direction : "asc"
                  }
                  onClick={() =>
                    setSortConfig((prev) => ({
                      field: "status",
                      direction:
                        prev.field === "status" && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }))
                  }
                >
                  <strong>Status</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...events]
              .sort((a, b) => {
                const { field, direction } = sortConfig;

                if (field === "date") {
                  const aDate = new Date(a.date).getTime();
                  const bDate = new Date(b.date).getTime();
                  return direction === "asc" ? aDate - bDate : bDate - aDate;
                }

                const aValue = (a[field] || "").toString().toLowerCase();
                const bValue = (b[field] || "").toString().toLowerCase();

                if (aValue < bValue) return direction === "asc" ? -1 : 1;
                if (aValue > bValue) return direction === "asc" ? 1 : -1;
                return 0;
              })
              .map((event) => (
                <TableRow key={event._id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell
                    sx={{
                      color: ["CANCELLED", "DRAFT", "CONFIRMED"].includes(
                        event.status,
                      )
                        ? "#ffffff"
                        : undefined,
                      backgroundColor:
                        event.status === "CANCELLED"
                          ? "#dc3545"
                          : event.status === "DRAFT"
                            ? "#6c757d"
                            : event.status === "CONFIRMED"
                              ? "#28a745"
                              : undefined,
                    }}
                  >
                    {event.status}
                  </TableCell>
                  <TableCell align="right">
                    {isAuthenticated && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDialog(event)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="meetup">Meetup</MenuItem>
                <MenuItem value="talk">Talk</MenuItem>
                <MenuItem value="social">Social</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Organizer"
              value={formData.organizer}
              onChange={(e) =>
                setFormData({ ...formData, organizer: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
