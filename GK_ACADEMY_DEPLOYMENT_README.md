# GK Academy — Guía de Despliegue

Esta guía documenta el proceso realizado para desplegar **GK Academy** usando:

- **Vercel** para el frontend en Next.js
- **Railway** para el backend en NestJS
- **MongoDB en Railway** como base de datos
- Variables de entorno para conectar frontend, backend y base de datos

---

## 1. Estructura del proyecto

El repositorio está organizado como monorepo:

```text
gkacademy/
├── apps/
│   ├── api/     # Backend NestJS
│   └── web/     # Frontend Next.js
```

Repositorio utilizado:

```text
javierariza2411/gkacademy
```

Rama principal:

```text
main
```

---

# 2. Desplegar MongoDB en Railway

## Paso 1 — Crear proyecto

1. Ingresar a Railway.
2. Crear un nuevo proyecto.
3. Conectar el repositorio de GitHub:

```text
javierariza2411/gkacademy
```

---

## Paso 2 — Agregar MongoDB

Dentro del proyecto de Railway:

1. Seleccionar **New**.
2. Seleccionar **Database**.
3. Elegir **MongoDB**.

Railway creará automáticamente un servicio MongoDB.

Dentro del servicio MongoDB aparecerán variables similares a:

```env
MONGO_URL=
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
```

No es necesario copiar manualmente usuario y contraseña si utilizamos una referencia interna de Railway.

---

# 3. Desplegar el backend NestJS en Railway

## Paso 1 — Crear el servicio

Crear un nuevo servicio dentro del mismo proyecto Railway utilizando el repositorio:

```text
javierariza2411/gkacademy
```

Como el backend está dentro de un monorepo, configurar:

```text
Root Directory: /apps/api
```

Esto indica a Railway que debe desplegar únicamente el proyecto NestJS.

---

## Paso 2 — Configurar variables de entorno

Ir a:

```text
Backend Service
→ Variables
```

Agregar:

```env
PORT=4000

JWT_SECRET=TU_SECRET_SEGURO
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://gkacademy-web.vercel.app

MONGODB_URI=${{MongoDB.MONGO_URL}}

PAYMENTS_MODE=mock

WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=

WOMPI_REDIRECT_URL=https://gkacademy-web.vercel.app/dashboard
```

> No guardar secretos reales directamente en GitHub.

---

## 4. Conectar NestJS con MongoDB

La variable más importante es:

```env
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

Esta sintaxis utiliza una referencia interna entre servicios de Railway.

Así el backend obtiene automáticamente la URL de conexión generada por MongoDB.

La aplicación debería utilizar:

```ts
process.env.MONGODB_URI
```

Por ejemplo:

```ts
MongooseModule.forRoot(process.env.MONGODB_URI)
```

---

# 5. Configurar CORS en NestJS

El backend debe permitir solicitudes provenientes del frontend.

En `main.ts`:

```ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

La variable utilizada en producción será:

```env
FRONTEND_URL=https://gkacademy-web.vercel.app
```

Esto evita tener que modificar Railway cada vez que Vercel realiza un nuevo deployment.

---

# 6. Generar dominio público en Railway

Una vez desplegado correctamente el backend:

1. Entrar al servicio NestJS.
2. Ir a **Settings**.
3. Buscar **Networking**.
4. Seleccionar **Generate Domain**.
5. Asociarlo al puerto:

```text
4000
```

En este proyecto se generó:

```text
https://artistic-celebration-production-d43c.up.railway.app
```

El backend utiliza `/api` como prefijo:

```text
https://artistic-celebration-production-d43c.up.railway.app/api
```

---

## Validación del backend

Si al abrir:

```text
https://artistic-celebration-production-d43c.up.railway.app/api
```

aparece:

```json
{
  "message": "Cannot GET /api",
  "error": "Not Found",
  "statusCode": 404
}
```

esto **no significa que Railway esté caído**.

Significa que NestJS está respondiendo correctamente, pero no existe una ruta:

```http
GET /api
```

Se deben probar endpoints reales, por ejemplo:

```text
/api/auth/login
/api/auth/register
```

según las rutas implementadas.

---

# 7. Desplegar frontend Next.js en Vercel

## Paso 1 — Importar repositorio

En Vercel:

1. Seleccionar **Add New Project**.
2. Importar:

```text
javierariza2411/gkacademy
```

---

## Paso 2 — Configurar el monorepo

Usar:

```text
Project Name: gkacademy-web
Framework Preset: Next.js
Root Directory: apps/web
```

No modificar manualmente:

```text
Build Command
Output Directory
Install Command
```

salvo que sea necesario por alguna configuración especial del proyecto.

---

# 8. Variables de entorno en Vercel

En la configuración del proyecto agregar:

```env
NEXT_PUBLIC_API_URL=https://artistic-celebration-production-d43c.up.railway.app/api
```

Si posteriormente se activa Wompi:

```env
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

Actualmente el proyecto utiliza:

```env
PAYMENTS_MODE=mock
```

por lo que Wompi puede permanecer sin configurar durante desarrollo o demostración.

---

# 9. Dominio estable de Vercel

Vercel genera URLs temporales para cada deployment, por ejemplo:

```text
gkacademy-xxxxxxxx-javier-arizas-projects.vercel.app
```

Estas URLs **no deben utilizarse como FRONTEND_URL en Railway**.

Usar el dominio estable del proyecto:

```text
https://gkacademy-web.vercel.app
```

Así los redeploys del frontend no requieren cambiar la configuración del backend.

---

# 10. Configuración final recomendada

## Railway — Backend

```env
PORT=4000

MONGODB_URI=${{MongoDB.MONGO_URL}}

JWT_SECRET=TU_SECRET_SEGURO
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://gkacademy-web.vercel.app

PAYMENTS_MODE=mock

WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=

WOMPI_REDIRECT_URL=https://gkacademy-web.vercel.app/dashboard
```

---

## Vercel — Frontend

```env
NEXT_PUBLIC_API_URL=https://artistic-celebration-production-d43c.up.railway.app/api
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

---

# 11. Flujo de comunicación

```text
Usuario
   │
   ▼
Vercel
Next.js Frontend
https://gkacademy-web.vercel.app
   │
   │ HTTPS / REST
   ▼
Railway
NestJS Backend
https://artistic-celebration-production-d43c.up.railway.app/api
   │
   ▼
MongoDB
Railway Database
```

---

# 12. Flujo normal después de hacer cambios

## Cambios en frontend

```bash
git add .
git commit -m "feat: cambios frontend"
git push origin main
```

Vercel detectará el push y realizará automáticamente un nuevo deployment.

No es necesario modificar Railway.

---

## Cambios en backend

```bash
git add .
git commit -m "feat: cambios backend"
git push origin main
```

Railway detectará el cambio y realizará un nuevo deployment del backend.

Si solo cambió código, no es necesario modificar las variables de entorno.

---

# 13. Cuándo modificar variables de entorno

Solo deben cambiarse cuando cambien datos de configuración, por ejemplo:

- nuevo dominio del frontend
- nueva base de datos
- nuevo `JWT_SECRET`
- activación de Wompi
- nuevas credenciales externas
- nuevos servicios

Un redeploy normal **no requiere cambiar las variables**.

---

# 14. Seguridad

No utilizar en producción:

```env
JWT_SECRET=change_this_super_secret
```

Generar un secret largo y aleatorio.

Ejemplo desde terminal:

```bash
openssl rand -base64 48
```

El valor debe guardarse únicamente en Railway.

No subir archivos `.env` al repositorio.

Agregar al `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

---

# 15. Variables locales para desarrollo

Ejemplo:

```env
# API

PORT=4000

MONGODB_URI=mongodb://mongo:27017/gk_academy

JWT_SECRET=change_this_super_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

PAYMENTS_MODE=mock

WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=

WOMPI_REDIRECT_URL=http://localhost:3000/dashboard


# WEB

NEXT_PUBLIC_API_URL=http://localhost:4000/api

NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

---

# 16. Diferencia entre desarrollo y producción

### Desarrollo

```text
Frontend
http://localhost:3000

Backend
http://localhost:4000/api

MongoDB
mongodb://mongo:27017/gk_academy
```

### Producción

```text
Frontend
https://gkacademy-web.vercel.app

Backend
https://artistic-celebration-production-d43c.up.railway.app/api

MongoDB
MongoDB interno de Railway
```

---

# 17. Checklist de despliegue

Antes de considerar la plataforma lista:

- [ ] MongoDB está Online en Railway.
- [ ] Backend NestJS está Online.
- [ ] `Root Directory` del backend es `/apps/api`.
- [ ] `MONGODB_URI` referencia el servicio MongoDB.
- [ ] `JWT_SECRET` es seguro.
- [ ] Backend tiene dominio público.
- [ ] Frontend está desplegado en Vercel.
- [ ] `Root Directory` del frontend es `apps/web`.
- [ ] `NEXT_PUBLIC_API_URL` apunta a Railway.
- [ ] `FRONTEND_URL` apunta al dominio estable de Vercel.
- [ ] CORS está configurado.
- [ ] Registro funciona.
- [ ] Login funciona.
- [ ] Dashboard consume correctamente la API.
- [ ] `.env` no está en GitHub.

---

# 18. Arquitectura final

La configuración seleccionada permite mantener una infraestructura sencilla:

```text
Next.js
  ↓
Vercel
  ↓
NestJS REST API
  ↓
Railway
  ↓
MongoDB
```

Ventajas:

- despliegues automáticos con GitHub
- HTTPS automático
- dominio estable
- variables de entorno administradas
- base de datos persistente
- bajo costo inicial
- escalabilidad sencilla
- sin administrar servidores manualmente
- sin necesidad inicial de AWS, Kubernetes o infraestructura compleja

---

## GK Academy

Stack utilizado:

```text
Frontend: Next.js
Backend: NestJS
Database: MongoDB
Frontend Hosting: Vercel
Backend Hosting: Railway
Database Hosting: Railway
Repository: GitHub
```
