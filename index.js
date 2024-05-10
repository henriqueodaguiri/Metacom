import express from "express";
import path from "path";

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