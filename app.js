const express = require("express");
const app = express();
const port = 3000;
const { InsertCarInfoIntoDatabase } = require("./database/services"); // Henter funkjsonen som vi eksporterte i services
const bodyParser = require("body-parser"); // Hjelper oss å hente ut req.body

// Middleware for å parse URL-encoded data (f.eks. fra skjemaer)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for å parse JSON-data
app.use(bodyParser.json());

// Setter opp EJS som malmotor for å rendere HTML-sider
app.set("view engine", "ejs");

// Rute for hovedsiden (GET forespørsel)
app.get("/", (req, res) => {
    // Renders index.ejs-filen fra views-mappen
    res.render("index");
});

// Rute for å håndtere skjema innsending (POST forespørsel)
app.post("/", (req, res) => {
    const input = req.body.carType; // Henter data fra input-feltet med navnet "carType" i skjemaet
    InsertCarInfoIntoDatabase(input); // Kaller funksjonen for å lagre data i databasen
    return res.redirect("/"); // Omdirigerer brukeren tilbake til hovedsiden
});

// Starter serveren og lytter på port 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
