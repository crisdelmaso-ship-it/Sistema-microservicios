# Sistema de microservicios

## Requisitos

- Git
- Node.js 20 o superior y npm
- Java 21
- MySQL 8 accesible desde el equipo

## Configuracion despues de clonar

Los archivos `.env` reales no se versionan porque contienen credenciales. Copia las plantillas:

```powershell
Copy-Item .env.example .env
Copy-Item productos-service\.env.example productos-service\.env
Copy-Item productos-deseados-service\.env.example productos-deseados-service\.env
Copy-Item gateway-service\.env.example gateway-service\.env
```

Edita los archivos y coloca las credenciales compartidas. La configuracion esperada es:

```dotenv
# Raiz: .env (Java / db_auth)
DB_HOST=100.92.51.27
DB_PORT=3306
DB_NAME=db_auth
DB_USER=equipo
DB_USERNAME=equipo
DB_PASSWORD=<la clave compartida de MySQL>
JWT_SECRET=<el JWT_SECRET compartido>
JWT_EXPIRATION=86400000

# productos-service/.env (catalogo / db_products)
DB_HOST=100.92.51.27
DB_PORT=3306
DB_NAME=db_products
DB_USER=equipo
DB_PASSWORD=<la clave compartida de MySQL>
PORT=3001
JWT_SECRET=<el JWT_SECRET compartido>
JWT_EXPIRATION=86400000

# productos-deseados-service/.env (lista de deseos)
DB_HOST=100.92.51.27
DB_PORT=3306
DB_NAME=db_productos_deseados
DB_USER=equipo
DB_PASSWORD=<la clave compartida de MySQL>
PORT=3003
PRODUCTS_SERVICE_URL=http://localhost:3001
JWT_SECRET=<el JWT_SECRET compartido>
```

En `gateway-service/.env` deja las URLs de los servicios. Si todos corren en el mismo equipo, los valores de la plantilla con `localhost` son correctos. Si un servicio corre en otro equipo o contenedor, reemplaza `localhost` por su nombre DNS o IP accesible desde el gateway.

La IP `100.92.51.27` debe ser accesible desde el equipo de cada integrante, normalmente mediante la misma VPN. Las bases requeridas son:

- `db_auth`
- `db_products`
- `db_productos_deseados`
- `db_purchases`

Ejecuta los scripts disponibles en `productos-service/database` y `compras-service/database`. La base `db_auth` debe tener el esquema del servicio de autenticacion.

## Instalacion

```powershell
npm --prefix productos-service install
npm --prefix productos-deseados-service install
npm --prefix gateway-service install
npm --prefix frontend install
```

## Arranque

Abre una terminal por proceso desde la raiz:

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd spring-boot:run -f compras-service/pom.xml
npm --prefix productos-service start
npm --prefix productos-deseados-service start
npm --prefix gateway-service start
npm --prefix frontend start -- --port 4200
```

El frontend se sirve en todas las interfaces de red (`0.0.0.0`) para que otros equipos puedan abrirlo usando la IP del equipo que lo ejecuta. Durante el desarrollo, `frontend/proxy.conf.json` redirige las rutas `/api` al gateway en `http://localhost:3000`; por eso el navegador no llama directamente a los microservicios.

URLs locales:

- Frontend: `http://localhost:4200`
- Gateway: `http://localhost:3000/health`
- Autenticacion: `http://localhost:8080/api/v1`
- Compras: `http://localhost:8082/api/v1`
- Productos: `http://localhost:3001`
- Productos deseados: `http://localhost:3003`

El frontend usa el gateway para las llamadas API. Los `.env` reales permanecen ignorados por Git para no publicar credenciales; cada integrante debe crearlos después de clonar usando la plantilla y el bloque anterior.

## Error conocido al iniciar compras

El servicio de compras necesita `JWT_SECRET` para validar los mismos tokens que genera autenticacion. Su `application.yaml` carga opcionalmente el `.env` de la raiz. Si el archivo no existe o no contiene esa variable, Spring falla con `Could not resolve placeholder 'JWT_SECRET'` y no abre el puerto `8082`.

Si `JWT_SECRET` ya esta configurado y el arranque aun falla con `Access denied for user 'equipo'`, la comunicacion con la base `db_purchases` esta rechazando la credencial. En ese caso se debe corregir `DB_PASSWORD` o los permisos del usuario en MySQL; no es un problema del frontend ni del gateway.

Cuando un servicio no esta disponible, el frontend ya no queda esperando indefinidamente: muestra si no pudo conectarse al gateway o si el gateway devolvio un error `502/504`. Comprueba primero `http://localhost:3000/health` y que todos los servicios esten escuchando en sus puertos.
