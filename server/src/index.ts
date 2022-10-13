import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { Event } from "./events";
import { userRouter } from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";
import AppUOW from "./repositories";
import cors from "cors";
import "./seed";
import "colors";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on(Event.Connect, (socket: Socket) => {
  new AppUOW(socket);
});

app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.green.underline.bold)
);
