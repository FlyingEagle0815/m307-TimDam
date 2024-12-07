import { createApp, upload } from "./config.js";

const app = createApp({
  user: "timdam",
  host: "bbz.cloud",
  database: "timdam",
  password: "S_Y:4n*+7$yuKX!w",
  port: 30211,
});

// Startseite
app.get("/", async function (req, res) {
  res.render("start", {});
});

// Image-Upload
app.get("/new_post", async function (req, res) {
  res.render("new_post", {});
});

// UPDATE (ACCOUNT)
app.get("edit-account/:id", async function (req, res) {
  const event = await app.locals.pool.query("SELECT * FROM users WHERE id=$1", [
    req.params.id,
  ]);
  res.render("edit-account", { users: users.rows[0] });
});

// DELETE (ACCOUNT)
app.get("/delete-account/:id", async function (res, req) {
  await app.local.pool.query("DELETE * FROM users WHERE id=$1", [
    req.params.id,
  ]);
  res.redirect("/account");
});

// FAVORITES 123
app.post("/favorite/:id", async function (req, res) {
  const user = await login.loggedInUser(req);
  if (!user) {
    res.redirect("/login");
    return;
  }
  await app.locals.pool.query(
    "INSERT INTO favorites (route_id, user_id) VALUES ($1, $2)",
    [req.params.id, user.id]
  );
  res.redirect("/routes");
});

// app.post("/create_post", upload.single("image"), async function (req, res) {
//   const result = await app.locals.pool.query(
//     "INSERT INTO todos (text, dateiname) VALUES ($1, $2)",
//     [req.body.text, req.file.filename]
//   );
//   console.log(result);
//   res.redirect("/");
// });

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
