import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import sessions from "express-session";
import bbz307 from "bbz307";

// Exportiert die Funktion createApp, die eine neue Express-App erstellt.
export function createApp(dbconfig) {
  // Initialisiert eine Express-App-Instanz.
  const app = express();
  // Erstellt einen neuen Pool mit den übergebenen Konfigurationsdaten (dbconfig).
  const pool = new Pool(dbconfig);
  // Erstellt eine neue Instanz des bbz307.Login-Moduls zur Verwaltung der Benutzeranmeldung.
  const login = new bbz307.Login(
    // Initialisiert das Login-Modul für die Tabelle "users" mit den Spalten "username", "password", "email" und "image_url" und bindet den Connection-Pool ein.
    "users",
    ["username", "password", "email", "image_url"],
    pool
  );

  // Konfiguriert Sitzungsmanagement mit einem geheimen Schlüssel, einer 24-Stunden-Cookie-Lebensdauer und verhindert das erneute Speichern unveränderter Sitzungen.
  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir768",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  // REGISTER: Rendert die "register"-Seite, wenn die URL "/register" aufgerufen wird.
  app.get("/register", (req, res) => {
    res.render("register");
  });

  // Verarbeitet die Registrierung eines Benutzers.
  app.post("/register", upload.none(), async (req, res) => {
    // Ruft registerUser auf, um den Benutzer zu registrieren.
    const user = await login.registerUser(req);
    // Bei erfolgreicher Registrierung wird zur "/account"-Seite weitergeleitet.
    if (user) {
      res.redirect("/account");
      return;
      // Andernfalls wird zurück zur "/register"-Seite geleitet.
    } else {
      res.redirect("/register");
      return;
    }
  });

  // LOGIN: Rendert die "login"-Seite, wenn die URL "/login" aufgerufen wird.
  app.get("/login", (req, res) => {
    res.render("login");
  });

  // LOGOUT: Rendert die "logout"-Seite, wenn die URL "/logout" aufgerufen wird.
  app.get("/logout", (req, res) => {
    res.render("logout");
  });

  // ACCOUNT: Zeigt die "account"-Seite an, wenn ein Benutzer eingeloggt ist. Falls nicht, wird zur "/login"-Seite umgeleitet.
  app.get("/account", async (req, res) => {
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    res.render("account");
  });

  // EDIT-ACCOUNT: Zeigt die "edit-account"-Seite an und lädt die Benutzerdaten aus der Datenbank basierend auf der Benutzer-ID. Die Daten werden an die Vorlage übergeben.
  app.get("/edit-account", async (req, res) => {
    const users = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    res.render("edit-account", { users: users.rows[0] });
  });

  // Zeigt die "edit-account"-Seite an, wenn der Benutzer eingeloggt ist.
  app.get("/edit-account", async function (req, res) {
    // Prüft, ob ein Benutzer eingeloggt ist. Andernfalls wird zur "/login"-Seite umgeleitet.
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    // Lädt die Benutzerdaten basierend auf der ID des eingeloggten Benutzers aus der Datenbank.
    const userinfo = await pool.query("SELECT * FROM users where id=$1", [
      user.id,
    ]);
    // Übergibt die Benutzerdaten, den eingeloggten Benutzer und einen userLoggedIn-Status an die Vorlage.
    res.render("edit-account", {
      user: user,
      users: users.rows[0],
      userLoggedIn: true,
    });
  });

  // NEW POST: Rendert die "new_post"-Seite, wenn die URL "/new_post" aufgerufen wird.
  app.get("/new_post", (req, res) => {
    res.render("new_post");
  });

  // ROUTES: Rendert die "routes"-Seite, wenn die URL "/routes" aufgerufen wird.
  app.get("/routes", (req, res) => {
    res.render("routes");
  });

  // FAVORITES: Rendert die "favorite"-Seite, wenn die URL "/favorite" aufgerufen wird.
  app.get("/favorite", (req, res) => {
    res.render("favorite");
  });

  // FIVE LAKES
  app.get("/five-lakes", (req, res) => {
    res.render("five-lakes");
  });

  // START: Rendert die "five-lakes"-Seite, wenn die URL "/five-lakes" aufgerufen wird.
  app.get("/start", (req, res) => {
    res.render("start");
  });

  // UPDATE: Aktualisiert die Benutzerdaten in der Datenbank.
  app.post("/update-account", upload.none(), async function (rec, res) {
    // Führt ein UPDATE-Statement aus, um die Spalten "username", "password" und "email" für die angegebene Benutzer-ID (id) zu aktualisieren.
    await pool.query(
      "UPDATE users SET username=$1, password=$2, email=$3 WHERE id=$4",
      [req.body.username, req.body.password, req.body.email, req.body.id]
    );
    // Leitet anschliessend zur "/account"-Seite weiter.
    res.redirect("/account");
  });

  // LOGIN: Verarbeitet die Benutzeranmeldung.
  app.post("/login", upload.none(), async (req, res) => {
    // Versucht, den Benutzer mit loginUser anzumelden.
    const user = await login.loginUser(req);
    // Bei Erfolg wird zur "/account"-Seite weitergeleitet.
    if (!user) {
      res.redirect("/login");
      return;
      // Bei Fehlschlag wird zurück zur "/login"-Seite geleitet.
    } else {
      res.redirect("/account");
      return;
    }
  });

  // LOGOUT: Verarbeitet die Benutzerabmeldung.
  app.get("/logout"),
    async function (req, res) {
      const user = await login.loggedInUser(req);
      // Prüft, ob ein Benutzer eingeloggt ist. Falls nicht, wird zur "/login"-Seite umgeleitet.
      if (!user) {
        res.redirect("/login");
        return;
      }
      // Löscht das Sitzungs-Cookie (connect.sid), um den Benutzer abzumelden.
      res.clearCookie("connect.sid");
    };

  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.locals.pool = pool;

  return app;
}

// Exportiert "upload" für die Nutzung in anderen Dateien.
export { upload };
