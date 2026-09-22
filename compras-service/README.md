# Compras Service

Microservicio Java para registrar compras autenticadas y descontar stock del catalogo.

## Ejecucion

Requiere Java 21, MySQL y `productos-service` ejecutandose en el puerto `3001`.
La conexion usa el mismo servidor y usuario del servicio de login, pero con la base independiente `db_purchases`.

```bash
./mvnw spring-boot:run -f compras-service/pom.xml
```

En Windows:

```powershell
.\mvnw.cmd spring-boot:run -f compras-service\pom.xml
```

Variables principales:

```properties
PURCHASES_PORT=8082
PURCHASES_DB_URL=jdbc:mysql://100.92.51.27:3306/db_purchases?createDatabaseIfNotExist=true&serverTimezone=UTC
PURCHASES_DB_USERNAME=equipo
PURCHASES_DB_PASSWORD=la_misma_clave_de_DB_PASSWORD
PRODUCTOS_SERVICE_URL=http://localhost:3001
JWT_SECRET=la_misma_clave_base64_del_login
```

Tambien puedes ejecutar [db_purchases.sql](database/db_purchases.sql) manualmente. Si la base no existe, la opcion `createDatabaseIfNotExist=true` intenta crearla al iniciar el servicio.

## Endpoints

Todos requieren el encabezado `Authorization: Bearer <jwt>`.

### Crear compra

`POST http://localhost:8082/api/v1/purchases`

```json
{
  "productoId": 1,
  "cantidad": 2
}
```

El servicio consulta `GET /api/products/:id`, valida el stock, actualiza el restante con `PATCH /api/products/:id/stock` y guarda la compra.

### Consultar mis compras

`GET http://localhost:8082/api/v1/purchases`