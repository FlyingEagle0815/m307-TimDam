// Importiert die Funktionen "createApp" und "upload" aus der Datei "config.js".
import { createApp, upload } from "./config.js";

// Erstellt eine App-Instanz mit den angegebenen Konfigurationsdaten für den Zugriff auf die Datenbank.
const app = createApp({
  user: "timdam",
  host: "bbz.cloud",
  database: "timdam",
  password: "S_Y:4n*+7$yuKX!w",
  port: 30211,
});

// START: Rendert die "start"-Vorlage, wenn die Root-URL ("/") aufgerufen wird.
app.get("/", async function (req, res) {
  res.render("start", {});
});

// UPLOAD: Rendert die "new_post"-Vorlage, wenn die URL "/new_post" aufgerufen wird.
app.get("/new_post", async function (req, res) {
  res.render("new_post", {});
});

// DELETE: Löscht den Benutzer mit der angegebenen ID aus der Datenbank und leitet anschliessend zur "/account"-Seite weiter.
app.get("/delete-account/:id", async function (res, req) {
  await app.local.pool.query("DELETE * FROM users WHERE id=$1", [
    req.params.id,
  ]);
  res.redirect("/account");
});

// FAVORITES: Fügt eine Route zur Favoritenliste des eingeloggten Benutzers hinzu, wenn dieser authentifiziert ist, und leitet anschliessend zur "/routes"-Seite weiter. Andernfalls wird zur Login-Seite umgeleitet.
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

// UPLOAD: Verarbeitet das Hochladen eines Bildes und speichert die Routeninformationen (Titel, Beschreibung, Schwierigkeit, Zeit, Länge, Höhenmeter, Bild-URL) in der Tabelle "routes". Leitet anschliessend zur Startseite ("/") weiter.
app.post("/create_post", upload.single("image"), async function (req, res) {
  const result = await app.locals.pool.query(
    "INSERT INTO routes (title, description, difficulty, time, length, altitude, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [req.body.text, req.file.filename]
  );
  console.log(result);
  res.redirect("/");
});

// Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen!
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
