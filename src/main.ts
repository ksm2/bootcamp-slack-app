import express from "express";
import { Application } from "./application/Application.js";

const application = new Application();

const app = express();

app.get("/", (req, res) => {
  res.end("OK");
});

await application.start();

app.listen(8080, () => {
  console.log("App running on http://localhost:8080");
});
