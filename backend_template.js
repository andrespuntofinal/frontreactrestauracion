
/**
 * ESTO ES UNA GUÍA PARA TU BACKEND
 * 
 * 1. Instala Node.js en tu PC.
 * 2. En una carpeta nueva corre: 'npm init -y'
 * 3. Instala dependencias: 'npm install express mongoose cors dotenv'
 * 4. Crea este archivo como 'index.js' y corre: 'node index.js'
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// REEMPLAZA ESTO CON TU URI DE MONGO ATLAS
const MONGO_URI = "mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/comunidad_pro";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB ✅'))
  .catch(err => console.error('Error de conexión ❌', err));

// Definición de Esquemas (Ejemplo para Personas)
const PersonSchema = new mongoose.Schema({
  identification: String,
  fullName: String,
  phone: String,
  ministryId: String,
  isBaptized: Boolean,
  populationGroup: String,
  photoUrl: String
});

const Person = mongoose.model('Person', PersonSchema);

// RUTAS API
app.get('/api/people', async (req, res) => {
  const people = await Person.find();
  res.json(people);
});

app.post('/api/people', async (req, res) => {
  const newPerson = new Person(req.body);
  await newPerson.save();
  res.status(201).json(newPerson);
});

// Corre el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
});
