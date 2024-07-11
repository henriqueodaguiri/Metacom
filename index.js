import express from "express";
import path from "path";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "metacom_db",
  password: "",
  port: 5432,
});

db.connect();

db.query("SELECT * FROM users WHERE NAME = 'João' ", (err, res) => {
  if (err) {
    console.error("Erros executing query", err.stack);
  } else {
    users = res.rows;
  }

  db.end();
})

const app = express();
const port = 3000;
const __dirname = path.resolve();

// Define o middleware para servir os arquivos estáticos do diretório 'pages'
app.use(express.static(__dirname + '/pages'));
app.use(express.static(__dirname + '/dist'));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile('welcome-page.html', { root: __dirname + '/pages'});
});

app.listen(port, () => {
    console.log('Server started on port ' + port);
})