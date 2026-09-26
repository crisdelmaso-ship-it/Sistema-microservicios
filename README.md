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
INTERNAL_SERVICE_TOKEN=<token interno compartido con compras-service>

# productos-service/.env (catalogo / db_products)
DB_HOST=100.92.51.27
DB_PORT=3306
DB_NAME=db_products
DB_USER=equipo
DB_PASSWORD=<la clave compartida de MySQL>
PORT=3001
JWT_SECRET=<el JWT_SECRET compartido>
JWT_EXPIRATION=86400000
INTERNAL_SERVICE_TOKEN=<token interno compartido con compras-service>

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

Abre una terminal por proceso desde la raiz y ejecuta estos comandos:

```powershell
# 1) Autenticacion
.\mvnw.cmd spring-boot:run

# 2) Compras
.\mvnw.cmd spring-boot:run -f compras-service/pom.xml

# 3) Productos
npm --prefix productos-service start

# 4) Productos deseados
npm --prefix productos-deseados-service start

# 5) Gateway
npm --prefix gateway-service start

# 6) Frontend
npm --prefix frontend start -- --port 4200
```

Si quieres arrancar todo en una sola secuencia desde PowerShell, puedes usar:

```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; .\mvnw.cmd spring-boot:run'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; .\mvnw.cmd spring-boot:run -f compras-service/pom.xml'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; npm --prefix productos-service start'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; npm --prefix productos-deseados-service start'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; npm --prefix gateway-service start'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "C:\Users\jerlo\Sistema-microservicios-main"; npm --prefix frontend start -- --port 4200'
```

El frontend se sirve en todas las interfaces de red (`0.0.0.0`) para que otros equipos puedan abrirlo usando la IP del equipo que lo ejecuta. Durante el desarrollo, `frontend/proxy.conf.json` redirige las rutas `/api` al gateway en `http://localhost:3000`; por eso el navegador no llama directamente a los microservicios.

URLs locales:

- Frontend: `http://localhost:4200`
- Gateway: `http://localhost:3000/health`
- Autenticacion: `http://localhost:8080/api/v1`
- Compras: `http://localhost:8082/api/v1`
- Productos: `http://localhost:3001`
- Productos deseados: `http://localhost:3003`
//
El frontend usa el gateway para las llamadas API. Los `.env` reales permanecen ignorados por Git para no publicar credenciales; cada integrante debe crearlos después de clonar usando la plantilla y el bloque anterior.

## Cambios implementados para la sustentación

### 1. Roles y autorización

El sistema maneja dos roles almacenados en la tabla `users`:

- `USER`: puede consultar productos, agregarlos a favoritos y realizar compras.
- `ADMIN`: tiene las capacidades del usuario normal y además puede crear, editar, eliminar productos y actualizar su stock.

El registro público siempre crea usuarios con rol `USER`. El rol `ADMIN` se asigna directamente en la base de datos a una cuenta autorizada. Esto evita que cualquier persona se registre como administrador.

El flujo de seguridad es:

1. El usuario inicia sesión en el servicio de autenticación.
2. El servicio genera un JWT firmado con `JWT_SECRET`.
3. El JWT contiene `userId`, `username` y `role`.
4. El frontend guarda el JWT en `localStorage`.
5. El interceptor Angular agrega automáticamente `Authorization: Bearer <token>` a las peticiones protegidas.
6. El servicio de productos valida el token y permite las operaciones administrativas solo cuando `role` es `ADMIN`.

Ocultar botones en el frontend mejora la experiencia, pero la protección real está en el backend. Por eso un usuario normal recibe `403 Forbidden` aunque intente llamar la API directamente.

### 2. Compra de productos creados por el administrador

La compra atraviesa estos servicios:

```text
Frontend
	-> Gateway: POST /api/v1/purchases
	-> Compras: valida JWT del usuario
	-> Productos: consulta precio y stock
	-> Productos: descuenta stock
	-> Compras: guarda la compra en db_purchases
```

El error corregido ocurría al descontar el stock. La ruta de actualización de stock estaba protegida para administradores, pero el servicio de compras no es un usuario administrador: es una comunicación interna entre servicios.

La solución separa ambos permisos:

- El usuario conserva su JWT para identificarse y registrar la compra.
- `compras-service` envía `X-Service-Token` al actualizar stock.
- `productos-service` acepta ese token únicamente en la operación interna de stock.
- Crear, editar y eliminar productos continúan requiriendo un JWT con rol `ADMIN`.

El valor de `INTERNAL_SERVICE_TOKEN` debe ser el mismo en el `.env` raíz y en `productos-service/.env`. No se debe publicar el valor real en Git.

### 3. Corrección visual de los botones

Las tarjetas de producto tenían una sola fila para el precio, los botones de administración y el botón de compra. Cuando el usuario era administrador, esos elementos podían superponerse, especialmente en pantallas pequeñas.

La hoja de estilos ahora organiza el pie de la tarjeta en filas flexibles:

- el precio conserva su espacio;
- `Editar` y `Eliminar` se muestran en una fila independiente;
- `Comprar` ocupa una fila propia;
- el formulario administrativo cambia a una columna en dispositivos pequeños.

De esta forma los controles mantienen dimensiones estables y no se pisan entre sí.

## Pruebas realizadas

### Validar compilación

Desde la raíz del proyecto:

```powershell
.\mvnw.cmd -q -f compras-service/pom.xml -DskipTests compile
npm --prefix frontend run build
node --check productos-service/src/routes/productRoutes.js
```

### Validar autorización

Con un JWT de usuario normal, estas operaciones deben responder `403`:

```text
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}
```

Con un JWT de administrador, las mismas operaciones deben responder correctamente.

### Validar una compra

Después de crear un producto como administrador, iniciar sesión como usuario normal y ejecutar:

```powershell
$token = "JWT_DEL_USUARIO"
$body = @{ productoId = 10; cantidad = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post `
	-Uri "http://localhost:3000/api/v1/purchases" `
	-ContentType "application/json" `
	-Headers @{ Authorization = "Bearer $token" } `
	-Body $body
```

El resultado esperado es una compra creada, con `precioUnitario`, `total` y el stock del producto reducido en uno.

### Resultado comprobado

La prueba de integración realizada creó correctamente una compra para un producto nuevo:

- usuario comprador: `flowuser001`;
- producto probado: `10`;
- compra generada: `34`;
- respuesta HTTP: `201 Created`;
- stock actualizado correctamente.

//
## Error conocido al iniciar compras

El servicio de compras necesita `JWT_SECRET` para validar los mismos tokens que genera autenticacion. Su `application.yaml` busca el `.env` en el directorio actual y también en el directorio padre. Así funciona tanto si se ejecuta el comando desde la raiz como desde `compras-service`. Cada integrante puede usar sus propios valores de `PURCHASES_PORT`, `PURCHASES_DB_URL`, `PURCHASES_DB_USERNAME`, `PURCHASES_DB_PASSWORD` y `PRODUCTOS_SERVICE_URL` en su `.env` local. Si el archivo no contiene `JWT_SECRET`, Spring falla con `Could not resolve placeholder 'JWT_SECRET'` y no abre el puerto configurado.

Si `JWT_SECRET` ya esta configurado y el arranque aun falla con `Access denied for user 'equipo'`, la comunicacion con la base `db_purchases` esta rechazando la credencial. En ese caso se debe corregir `DB_PASSWORD` o los permisos del usuario en MySQL; no es un problema del frontend ni del gateway.

Cuando un servicio no esta disponible, el frontend ya no queda esperando indefinidamente: muestra si no pudo conectarse al gateway o si el gateway devolvio un error `502/504`. Comprueba primero `http://localhost:3000/health` y que todos los servicios esten escuchando en sus puertos. Si el frontend se abre desde otro equipo, usa la IP del equipo donde corre Angular; `localhost` siempre significa el equipo del navegador.
