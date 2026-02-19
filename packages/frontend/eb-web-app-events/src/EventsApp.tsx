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
import { AuthContext } from './AuthContext';

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

  const authContext = useContext(AuthContext);

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
        process.env.REACT_APP_API_GATEWAY_URL ||
          "http://localhost:4000/graphql",
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
        category: event.category,
        organizer: event.organizer,
        status: event.status,
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
          updateEvent(input: {
            id: "${editingId}"
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
          process.env.REACT_APP_API_GATEWAY_URL ||
            "http://localhost:4000/graphql",
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
          process.env.REACT_APP_API_GATEWAY_URL ||
            "http://localhost:4000/graphql",
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
        process.env.REACT_APP_API_GATEWAY_URL ||
          "http://localhost:4000/graphql",
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

        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ ml: "auto" }}
        >
          Create Event
        </Button>
      </Stack>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <strong>Title</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Location</strong>
              </TableCell>
              <TableCell>
                <strong>Category</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.category}</TableCell>
                <TableCell>{event.status}</TableCell>
                <TableCell align="right">
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
