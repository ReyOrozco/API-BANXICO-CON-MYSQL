Datos de la API de Banxico

## **Descripción del Proyecto**

Este proyecto está diseñado para obtener indicadores económicos desde la API de Banxico, almacenar los datos obtenidos en una base de datos MySQL y registrar el proceso para depuración y monitoreo. Los datos incluyen métricas como tipos de cambio, tasas de interés y valores de UDIS. El script está automatizado para ejecutarse diariamente a las 8:00 AM mediante el Programador de Tareas de Windows, asegurando que la información esté actualizada constantemente para su análisis.


## **Características**

Obtención de Datos desde la API de Banxico: Recupera indicadores económicos como:

SF43707  Reservas Internacionales.

SF61745  Tasa objetivo
SF60648  TIIE a 28 días.
SF60649  TIIE a 91 días.
SF60633  Cetes a 28 días.

SF43718  Pesos por Dólar. FIX.
SF60653  Pesos por Dólar. Fecha de liquidación.
SF46410  Euro.
SF46406  Yen japonés.
SF46407  Libra esterlina.
SF60632  Dólar Canadiense.

SP68257  Valor de UDIS.

Integración con MySQL: Almacena los datos obtenidos en una base de datos MySQL con tablas predefinidas.

Registro de Errores: Mantiene un archivo de registro (log.txt) para depuración y seguimiento de errores.

Automatización: Ejecución automática diaria mediante el Programador de Tareas de Windows.

Instalación

Requisitos Previos

Tener Node.js instalado en tu sistema.

Configurar las credenciales de la base de datos MySQL.

Contar con un token de la API de Banxico (reemplazar en el script).


## **Solicitar Token Banxico**
Ingresa a https://www.banxico.org.mx/SieAPIRest/service/v1/token

Token de consulta
El token de consulta es un requisito necesario para poder utilizar el API de series de tiempo. Consta de 64 caracteres alfanuméricos y debe ser enviado cada vez que se interactúe con los servicios provistos. El envío se debe realizar a través del header HTTP Bmx-Token o el parámetro token (El header tiene prioridad, si se envía el header se toma este valor en caso contrario se toma el valor del parámetro). Por ejemplo:

Query:
token=e3980208bf01ec653aba9aee3c2d6f70f6ae8b066d2545e379b9e0ef92e9de25
Solicitar token
Imagen de seguridad:
Código de seguridad:
Código de seguridad

Crear y reusar
 El token se genera una sola vez y se usa cuantas veces se necesite, respetando los límites de consulta.


Estatus de token
El API define un conjunto de límites en el número de peticiones que se realizan por token de consulta ( Más detalles ). En caso de que estos límites se superen, el token de consulta utilizado será inhabilitado hasta que concluya el periodo de tiempo en el cuál se superó el número límite de consultas.


## **Clona el repositorio**

git clone https://github.com/ReyOrozco/API-BANXICO-CON-MYSQL.git

Navega al directorio del proyecto:

cd API-BANXICO-CON-MYSQL

Instala las dependencias:

npm install

Actualiza config.json:

Reemplaza los valores de ejemplo con tus credenciales de MySQL.

Inserta tu token de la API de Banxico.



## **USO**

Ejecución Manual

Para ejecutar el script manualmente:

node ApiBanxico.js

Automatización con el Programador de Tareas

Abre el Programador de Tareas de Windows.

Crea una nueva tarea y configura:

Programa/Script: C:\Windows\System32\cmd.exe

Argumentos:

/c "cd /d C:\ruta\al\proyecto && node ApiBanxico.js >> log.txt 2>&1"

Horario: Diario a las 8:00 AM.

Guarda la tarea y verifica que no haya problemas de permisos administrativos.

## **Estructura de Archivos**

API-BANXICO-CON-MYSQL/
├── ApiBanxico.js       # Script principal para obtener e insertar datos
├── config.json        # Archivo de configuración para MySQL y la API
├── log.txt            # Archivo de registro para depuración y monitoreo
├── package.json       # Metadatos y dependencias del proyecto
├── README.md          # Documentación del proyecto


Base de Datos MySQL
## **Creación de tablas en MySQL** 
Crearemos una tabla indicadores que almacenará los datos obtenidos.

sql
CREATE TABLE indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serie_id VARCHAR(10) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    valor DECIMAL(15, 6) NOT NULL,
    UNIQUE (serie_id, fecha) -- Para evitar duplicados
);

## **Registro de Errores**

Toda la salida y los errores se registran en log.txt en el directorio principal del proyecto.

Asegúrate de otorgar permisos suficientes para que el script pueda escribir en el archivo de registro.

## **Contribuciones** 

No dudes en enviar problemas o pull requests para mejorar el proyecto. ¡Las contribuciones son siempre bienvenidas!

