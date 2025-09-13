import express, { json } from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(json());

// Endpoint de prueba
app.get('/api', (req, res) => {
  res.json({ message: 'Servidor Node corriendo 🚀' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
