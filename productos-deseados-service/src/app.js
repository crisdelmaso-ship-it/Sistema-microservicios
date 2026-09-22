const express = require('express');

const desiredProductRoutes = require('./routes/desiredProductRoutes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    mensaje: 'Productos deseados service funcionando correctamente'
  });
});

app.use('/api/products-wanted', desiredProductRoutes);

module.exports = app;