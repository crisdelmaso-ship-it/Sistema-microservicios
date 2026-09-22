const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = require('./app');
const sequelize = require('./config/database');

// Importar modelos
require('./models/DesiredProduct');
require('./models/DesiredProductHistory');

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log('Conexión a la base de datos establecida correctamente');

    await sequelize.sync();

    console.log('Modelos sincronizados correctamente');

    app.listen(PORT, () => {
      console.log(`Productos deseados service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servicio:', error.message);
  }
}

startServer();