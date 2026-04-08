import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cors from 'cors';
import http from "http";
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import dns from "dns";
import { initSocket } from "./socket/attendance.socket.js";
dns.setDefaultResultOrder("ipv4first");
 
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.get("/", (req, res) => {
    res.json({
        success : true,
        message : "Attendance API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

connectDB();

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => console.log(`the server is listening on the port : ${PORT}`));