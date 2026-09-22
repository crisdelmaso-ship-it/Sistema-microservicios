# Frontend Angular

Aplicacion Angular standalone para registro, login, catalogo, lista de deseos y compras.

## Flujo local

Inicia los servicios backend y el gateway, en este orden recomendado:

```bash
cd gateway-service && npm start
cd frontend && npm start
```

Abre `http://localhost:4200/`. El frontend consume exclusivamente el gateway en
`http://localhost:3000`.

## JWT

Al iniciar sesion, el backend devuelve el token en `data.jwt`. El frontend lo
guarda en `sessionStorage` con la clave `nova_jwt` y el interceptor lo envia en
todas las llamadas como `Authorization: Bearer <token>`.

`sessionStorage` mantiene el token solo mientras exista esa pestana del
navegador. Al cerrar sesion se elimina. Para produccion, la alternativa mas
segura es mover la sesion a una cookie `HttpOnly`, `Secure`, `SameSite`, emitida
por el backend; Angular no puede crear ni leer una cookie HttpOnly.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
