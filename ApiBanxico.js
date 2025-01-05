const fs = require('fs');
const axios = require('axios');
const mysql = require('mysql2/promise');
const { parseStringPromise } = require('xml2js');

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

// Función para escribir en el archivo de log
function escribirLog(mensaje) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('log.txt', `[${timestamp}] ${mensaje}\n`);
}

// Función para obtener datos de la API de Banxico
async function obtenerDatosBanxico() {
  const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesIds.join(',')}/datos/oportuno?token=${BANXICO_TOKEN}`;
  try {
    const response = await axios.get(url, { responseType: 'text' });
    escribirLog('Datos obtenidos correctamente de la API de Banxico.');
    return response.data;
  } catch (error) {
    escribirLog(`Error al consultar la API de Banxico: ${error.message}`);
    throw error;
  }
}

// Función para parsear el XML a JSON
async function parsearDatosXml(xmlData) {
  try {
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    const series = result.series.serie;
    const seriesData = Array.isArray(series) ? series : [series];

    escribirLog('Datos parseados correctamente.');
    return seriesData.map(serie => {
      const obs = Array.isArray(serie.Obs) ? serie.Obs : [serie.Obs];
      return obs.map(dato => ({
        serieId: serie.$.idSerie,
        titulo: serie.$.titulo,
        fecha: dato.fecha,
        valor: parseFloat(dato.dato.replace(',', '')),
      }));
    }).flat();
  } catch (error) {
    escribirLog(`Error al parsear los datos XML: ${error.message}`);
    throw error;
  }
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
    escribirLog('Datos insertados correctamente en la base de datos.');
  } catch (error) {
    escribirLog(`Error al insertar los datos en MySQL: ${error.message}`);
    throw error;
  } finally {
    await connection.end();
  }
}

// Ejecución del script
(async function main() {
  try {
    escribirLog('Inicio de la actualización...');
    const xmlData = await obtenerDatosBanxico();
    const datos = await parsearDatosXml(xmlData);
    await insertarDatosEnMysql(datos);
    escribirLog('Actualización completada con éxito.');
  } catch (error) {
    escribirLog(`Ocurrió un error: ${error.message}`);
  }
})();
