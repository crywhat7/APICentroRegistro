const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const controller = require('./controllers/controllers');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/personas', (req, res) => {
  res.status(200).json(controller.getPersonas());
});

app.post('/persona', (req, res) => {
  res.status(200).json(controller.addPersona(req.body));
});

app.put('/persona', (req, res) => {
  res.status(200).json(controller.deletePersona(req.query.numeroIdentidad));
});

app.put('/compactar', (req, res) => {
  res.status(200).json(controller.compactar());
});

app.get('/nacimiento', (req, res) => {
  res
    .status(200)
    .json(controller.obtenerPartidaNacimiento(req.query.numeroIdentidad));
});

app.post('/nacimiento', (req, res) => {
  res.status(200).json(controller.crearPartidaNacimiento(req.body));
});

app.get('/tarjeta-identidad', (req, res) => {
  res
    .status(200)
    .json(controller.getTarjetaIdentidad(req.query.numeroIdentidad));
});
app.post('/tarjeta-identidad', (req, res) => {
  res
    .status(200)
    .json(controller.crearTarjetaIdentidad(req.body.numeroIdentidad));
});

app.get('/visualizacion-pura-personas', (req, res) => {
  res.status(200).json(controller.getArchivoPuro());
});

app.get('/visualizacion-pura-disponibles', (req, res) => {
  res.status(200).json(controller.getArchivoDisponiblesPuro());
});

app.listen(port, () => {
  console.log(`API en http://localhost:${port}`);
});

controller.revisarDisponibles();
