import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import sessions from "express-session";
import bbz307 from "bbz307";

export function createApp(dbconfig) {
  const app = express();

  const pool = new Pool(dbconfig);

  const login = new bbz307.Login(
    "users",
    ["username", "password", "email", "image_url"],
    pool
  );

  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir768",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  // REGISTER
  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/account");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });

  // LOGIN
  app.get("/login", (req, res) => {
    res.render("login");
  });

  // LOGOUT
  app.get("/logout", (req, res) => {
    res.render("logout");
  });

  // ACCOUNT
  app.get("/account", async (req, res) => {
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    res.render("account");
  });

  // EDIT - ACCOUNT
  app.get("/edit-account", async (req, res) => {
    const users = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    res.render("edit-account", { users: users.rows[0] });
  });

  app.get("/edit-account", async function (req, res) {
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    const userinfo = await pool.query("SELECT * FROM users where id=$1", [
      user.id,
    ]);
    res.render("edit-account", {
      user: user,
      users: users.rows[0],
      userLoggedIn: true,
    });
  });

  // NEW POST
  app.get("/new_post", (req, res) => {
    res.render("new_post");
  });

  // ROUTES
  app.get("/routes", (req, res) => {
    res.render("routes");
  });

  // FAVORITES 123
  app.get("/favorite", (req, res) => {
    res.render("favorite");
  });

  // FIVE LAKES
  app.get("/five-lakes", (req, res) => {
    res.render("five-lakes");
  });

  // START
  app.get("/start", (req, res) => {
    res.render("start");
  });

  // UPDATE
  app.post("/update-account", upload.none(), async function (rec, res) {
    await pool.query(
      "UPDATE users SET username=$1, password=$2, email=$3 WHERE id=$4",
      [req.body.username, req.body.password, req.body.email, req.body.id]
    );
    res.redirect("/account");
  });

  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/account");
      return;
    }
  });

  app.get("/logout"),
    async function (req, res) {
      const user = await login.loggedInUser(req);
      if (!user) {
        res.redirect("/login");
        return;
      }
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

export { upload };
