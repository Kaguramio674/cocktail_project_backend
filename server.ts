import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from "express";
import Server from "./src/index";

const app: Application = express();
const server: Server = new Server(app);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// app
//   .listen(PORT, '0.0.0.0', function () {
//     console.log(`Server is running on port 0.0.0.0:${PORT}.`);
//   })
//   .on("error", (err: any) => {
//     if (err.code === "EADDRINUSE") {
//       console.log("Error: address already in use");
//     } else {
//       console.log(err);
//     }
//   });
app
  .listen(PORT, '0.0.0.0', function () {
    console.log(`Version 1.1, Port:${PORT}.`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("Error: address already in use");
    } else {
      console.log(err);
    }
  });

