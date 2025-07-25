# Proxy API para el Boletín Oficial del Estado (BOE)

![NestJS Logo](https://nestjs.com/img/logo-small.svg)

Este proyecto es un proxy desarrollado con **NestJS** que expone una interfaz moderna y robusta para interactuar con la [API de Legislación Consolidada del Boletín Oficial del Estado (BOE)](https://www.boe.es/datosabiertos/).

El objetivo principal es actuar como intermediario, facilitando el consumo de los datos oficiales y permitiendo añadir capas adicionales de lógica, caché o monitorización de forma sencilla.

## 🚀 Tecnologías Utilizadas

- **Framework**: [NestJS](https://nestjs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Gestor de Paquetes**: [NPM](https://www.npmjs.com/) / [Yarn](https://yarnpkg.com/)

---

## 🏁 Primeros Pasos

Sigue estos pasos para tener una copia del proyecto funcionando en tu máquina local.

### Prerrequisitos

Asegúrate de tener [Node.js](https://nodejs.org/) (versión >= 16) instalado.

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/boe-repository-api.git
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd boe-repository-api
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```

### Configuración del Entorno

Este proxy se conecta a la API oficial del BOE. Es una buena práctica gestionar la URL base a través de variables de entorno.

1.  Crea un archivo `.env` en la raíz del proyecto.
2.  Añade la siguiente variable:

    ```env
    BOE_API_BASE_URL=https://boe.es/datosabiertos/api
    ```

### Ejecución de la Aplicación

```bash
# Modo desarrollo con auto-recarga
$ npm run start:dev

# Modo producción
$ npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000` por defecto.

---

## 📖 Endpoints de la API

Este proxy replica la estructura de la API oficial del BOE para mantener la consistencia.

### 1. Lista de Normas

Obtiene una lista de las normas consolidadas. Soporta los mismos parámetros que la API oficial (`from`, `to`, `query`, `offset`, `limit`).

-   **Endpoint**: `GET /legislacion-consolidada`
-   **Proxy de**: `GET https://boe.es/datosabiertos/api/legislacion-consolidada`
-   **Ejemplo**: `http://localhost:3000/legislacion-consolidada?limit=10&offset=5`

### 2. Obtención de una Norma Concreta

Recupera la información completa o parcial de una norma específica a través de su identificador.

#### Norma Completa
-   **Endpoint**: `GET /legislacion-consolidada/:id`
-   **Proxy de**: `GET https://boe.es/datosabiertos/api/legislacion-consolidada/id/{id}`
-   **Ejemplo**: `http://localhost:3000/legislacion-consolidada/BOE-A-2015-10566`

#### Partes de la Norma

También puedes solicitar fragmentos específicos de la norma:

-   **Metadatos**: `GET /legislacion-consolidada/:id/metadatos`
-   **Análisis**: `GET /legislacion-consolidada/:id/analisis`
-   **Metadatos ELI**: `GET /legislacion-consolidada/:id/metadata-eli`
-   **Texto Completo**: `GET /legislacion-consolidada/:id/texto`
-   **Índice del Texto**: `GET /legislacion-consolidada/:id/texto/indice`
-   **Bloque de Texto**: `GET /legislacion-consolidada/:id/texto/bloque/:id_bloque`

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.