import { createApp } from "./config.js";

const app = createApp({
  user: "timdam",
  host: "bbz.cloud",
  database: "timdam",
  password: "S_Y:4n*+7$yuKX!w",
  port: 30211,
});
6;
/* Startseite */
app.get("/", async function (req, res) {
  res.render("start", {});
});

app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});

const bbz307 = require("bbz307");
