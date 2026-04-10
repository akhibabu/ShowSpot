const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const events = [
  { id: 1, name: "Summer Music Festival 2026", date: "Jun 15, 2026", time: "18:00", venue: "Central Park Amphitheater", category: "Music", price: 75, total: 500, available: 342, bookedSeats: ["C2", "D3", "D4"] },
  { id: 2, name: "Food & Wine Expo 2026", date: "Jul 04, 2026", time: "12:00", venue: "Pier 39, San Francisco", category: "Food", price: 45, total: 400, available: 218, bookedSeats: ["A1", "B3"] },
  { id: 3, name: "Tech Conference 2026", date: "Aug 20, 2026", time: "09:00", venue: "Moscone Center", category: "Conference", price: 120, total: 600, available: 389, bookedSeats: ["E5"] },
  { id: 4, name: "Comedy Night Live", date: "Sep 03, 2026", time: "20:00", venue: "The Laugh Factory", category: "Comedy", price: 55, total: 300, available: 182, bookedSeats: ["B2", "F6"] },
  { id: 5, name: "Art Basel Showcase", date: "Oct 10, 2026", time: "10:00", venue: "Miami Beach Convention Center", category: "Art", price: 30, total: 1000, available: 756, bookedSeats: [] },
  { id: 6, name: "NBA All-Star Weekend", date: "Feb 14, 2027", time: "19:30", venue: "United Center Chicago", category: "Sports", price: 200, total: 500, available: 120, bookedSeats: ["A1", "A2", "B1"] }
];

const bookings = [];

function findEventById(id) {
  return events.find(event => event.id === Number(id));
}

function findEventByName(name) {
  return events.find(event => event.name.toLowerCase() === String(name).toLowerCase());
}

function serializeEvent(event) {
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    time: event.time,
    venue: event.venue,
    category: event.category,
    price: event.price,
    total: event.total,
    available: event.available,
    bookedSeats: event.bookedSeats
  };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/events", (req, res) => {
  res.json(events.map(serializeEvent));
});

app.get("/events/:id", (req, res) => {
  const event = findEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  res.json(serializeEvent(event));
});

app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/events", (req, res) => {
  const { name, date, time, venue, category, price, total } = req.body;
  if (!name || !date || !venue || !category || typeof price !== "number" || typeof total !== "number") {
    return res.status(400).json({ message: "Missing or invalid event data" });
  }
  const id = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const event = {
    id,
    name,
    date,
    time,
    venue,
    category,
    price,
    total,
    available: total,
    bookedSeats: []
  };
  events.push(event);
  res.status(201).json(serializeEvent(event));
});

app.delete("/events/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = events.findIndex(event => event.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Event not found" });
  }
  events.splice(index, 1);
  res.json({ message: "Event deleted" });
});

app.post("/book", (req, res) => {
  const { eventId, event, seat, name, email, phone } = req.body;
  let selectedEvent = null;

  if (eventId !== undefined) {
    selectedEvent = findEventById(eventId);
  }
  if (!selectedEvent && event) {
    selectedEvent = findEventByName(event);
  }

  if (!selectedEvent) {
    return res.status(400).json({ message: "Event not found" });
  }
  if (!seat || typeof seat !== "string") {
    return res.status(400).json({ message: "Please select a valid seat" });
  }
  if (selectedEvent.bookedSeats.includes(seat)) {
    return res.status(400).json({ message: "Seat already booked" });
  }

  selectedEvent.bookedSeats.push(seat);
  selectedEvent.available = Math.max(0, selectedEvent.available - 1);

  const booking = {
    id: `BK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    eventId: selectedEvent.id,
    event: selectedEvent.name,
    seats: [seat],
    total: selectedEvent.price,
    name: name || "Guest",
    email: email || null,
    phone: phone || null,
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);

  res.json({ message: "Booking successful", booking });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
