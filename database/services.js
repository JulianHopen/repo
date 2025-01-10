// Henter inn databasekobling
const { createConnection } = require("./database");

// En funksjon som setter inn informasjon i databasen
async function InsertCarInfoIntoDatabase(input) {
  const connection = await createConnection();
  // Åpner en databasekobling
  connection.connect();

  /* Setter inn data som kommer fra input-feltet i HTML med navnet "carType" 
       og legger det inn i tabellen car_type.
       
       Bruker "Named parameters" for å beskytte mot SQL-injeksjon ved hjelp av 
       spørsmålstegn (?) og setter de korrekte verdiene inn i "connection.execute".
    */
  const query = "INSERT INTO car (car_type) VALUES (?)";
  connection.execute(query, [input]);

  // Lukker databasekoblingen
  connection.end();
}

// Eksporterer funksjonen slik at den kan brukes i andre filer, for eksempel app.js
module.exports = { InsertCarInfoIntoDatabase };
