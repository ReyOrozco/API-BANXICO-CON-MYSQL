const axios = require('axios');
const mysql = require('mysql2/promise');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: 'TU_Host',
  user: 'TU_user',
  password: 'TU_password',
  database: 'TU_Database',
  port: 3306,
};

// Configuración de la API de Banxico
const BANXICO_TOKEN = 'TU_TOKEN_BANXICO';
const seriesIds = [
  'SF43707', 'SF61745', 'SF60648', 'SF60649', 'SF60633',
  'SF43718', 'SF60653', 'SF46410', 'SF46406', 'SF46407', 'SF60632', 'SP68257'
];
// Función para obtener datos de la API de Banxico
async function obtenerDatosBanxico() {
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesIds.join(',')}/datos/oportuno?token=${BANXICO_TOKEN}`;
  const response = await axios.get(url);
  return response.data;
}

// Función para convertir el formato de fecha de 'DD/MM/YYYY' a 'YYYY-MM-DD'
function convertirFecha(fecha) {
  const [dia, mes, año] = fecha.split('/');
  return `${año}-${mes}-${dia}`;
}

// Función para parsear los datos JSON
function parsearDatosJson(jsonData) {
  return jsonData.bmx.series.map(serie => {
    return serie.datos.map(dato => ({
      serieId: serie.idSerie,
      titulo: serie.titulo,
      fecha: convertirFecha(dato.fecha),
      valor: parseFloat(dato.dato.replace(',', ''))
    }));
  }).flat();
}

// Función para insertar los datos en MySQL
async function insertarDatosEnMysql(data) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    for (const registro of data) {
      const query = `
        INSERT INTO indicadores (serie_id, titulo, fecha, valor)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
      `;
      const values = [registro.serieId, registro.titulo, registro.fecha, registro.valor];
      await connection.execute(query, values);
    }
  } finally {
    await connection.end();
  }
}

// Ejecución del script
(async function main() {
  try {
    const jsonData = await obtenerDatosBanxico();
    const datos = parsearDatosJson(jsonData);
    await insertarDatosEnMysql(datos);
    console.log('Actualización completada con éxito.');
  } catch (error) {
    console.error('Ocurrió un error:', error.message);
  }
})();
