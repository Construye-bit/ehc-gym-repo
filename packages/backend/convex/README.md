# 📦 Módulo de Perfiles — README de Integración (Backend → Frontend)

> Sprint: Perfiles (client / trainer / admin)  
> Estado: ✅ listo (tests 12/12)  
> Convex API: `POST {{CONVEX_URL}}/api/query` y `POST {{CONVEX_URL}}/api/mutation}`  
> Auth: `Authorization: Bearer <JWT>` (Clerk JWT verificado por Convex)

---

## 🧭 Cómo consumir (forma general)

Todas las llamadas al backend Convex desde Postman/Front siguen este **contrato HTTP**:

- **URL** (Query): `POST {{CONVEX_URL}}/api/query`  
- **URL** (Mutation): `POST {{CONVEX_URL}}/api/mutation`
- **Headers**:
  - `Authorization: Bearer {{JWT_SUPER}} | {{JWT_ADMIN}} | {{JWT_TRAINER}} | {{JWT_CLIENT}}`
  - `Content-Type: application/json`
- **Body JSON**:
  ```json
  {
    "path": "modulo/submodulo/tipo:nombreFuncion",
    "args": { "...": "ver por función" },
    "format": "json"
  }
  ```

**Notas:**

- Cuando la función no requiere entradas, args puede ir como `{}`.
- Cuando hay entradas, el patrón en este módulo es: `args: { "payload": { ... } }`.

### 🔐 RBAC y control de acceso (resumen)

Rol | Puede llamar a…
--- | ---
SUPER_ADMIN | Todo lo de admin, y lectura de cualquier perfil.
ADMIN | Lectura de perfiles (getUserProfileById), y administración de contratos cliente–entrenador.
TRAINER | Su propio perfil (getMyTrainerProfile) y edición de specialties, work_schedule, phone.
CLIENT | Su propio perfil (getMyClientProfile), preferencias, métricas de salud y progreso.

**Errores comunes:**

- **UNAUTHORIZED**: falta o inválido el token (sin header Authorization).
- **FORBIDDEN**: no tiene el rol requerido.
- **NOT_FOUND**: entidad inexistente.
- **VALIDATION_ERROR**: payload mal formado.

### 🌳 Estructura de paths de este módulo

```
profiles/admin/queries:getUserProfileById
profiles/admin/mutations:adminSetClientContract
profiles/trainer/queries:getMyTrainerProfile
profiles/trainer/mutations:updateTrainerSpecialties
profiles/trainer/mutations:updateTrainerSchedule
profiles/trainer/mutations:updateMyPhone
profiles/client/queries:getMyClientProfile
profiles/client/queries:listHealthMetrics
profiles/client/queries:listProgress
profiles/client/queries:listMyContracts
profiles/client/mutations:upsertClientPreferences
profiles/client/mutations:addHealthMetric
profiles/client/mutations:addProgress
```

---

## 📄 DTOs (formas de datos)

**Person (lectura)**  
json  

```json
{
  "_id": "Id<persons>",
  "user_id": "Id<users>",
  "name": "string",
  "last_name": "string",
  "born_date": "YYYY-MM-DD",
  "document_type": "CC|TI|CE|PASSPORT",
  "document_number": "string",
  "phone": "string|null",
  "active": true,
  "created_at": 0,
  "updated_at": 0
}
```

**Trainer (lectura)**  
json  

```json
{
  "_id": "Id<trainers>",
  "person_id": "Id<persons>",
  "user_id": "Id<users>|null",
  "branch_id": "Id<branches>|null",
  "employee_code": "string",
  "specialties": ["string", "..."],
  "work_schedule": {
    "monday": { "start": "HH:MM", "end": "HH:MM" },
    "...": {}
  },
  "status": "ACTIVE|INACTIVE|ON_VACATION",
  "created_at": 0,
  "updated_at": 0
}
```

**Client (lectura)**  
json  

```json
{
  "_id": "Id<clients>",
  "person_id": "Id<persons>",
  "user_id": "Id<users>|null",
  "status": "ACTIVE|INACTIVE",
  "is_payment_active": true,
  "join_date": 0,
  "end_date": 0,
  "created_by_user_id": "Id<users>|null",
  "created_at": 0,
  "updated_at": 0,
  "active": true
}
```

**ClientPreferences**  
json  

```json
{
  "_id": "Id<client_preferences>",
  "client_id": "Id<clients>",
  "preferred_time_range": { "start": "HH:MM", "end": "HH:MM" },
  "routine_type": "FUERZA|CARDIO|MIXTO|MOVILIDAD",
  "goal": "BAJAR_PESO|TONIFICAR|GANAR_MASA|RESISTENCIA",
  "notes": "string|null",
  "created_at": 0,
  "updated_at": 0
}
```

**HealthMetric (lectura)**  
json  

```json
{
  "_id": "Id<client_health_metrics>",
  "client_id": "Id<clients>",
  "measured_at": 0,
  "weight_kg": 0,
  "height_cm": 0,
  "bmi": 0,
  "body_fat_pct": 0,
  "notes": "string|null",
  "created_by_user_id": "Id<users>",
  "created_at": 0,
  "updated_at": 0
}
```

**Progress (lectura)**  
json  

```json
{
  "_id": "Id<client_progress>",
  "client_id": "Id<clients>",
  "kind": "MEDICION|HITO|RUTINA",
  "metric_key": "string|null",
  "metric_value": 0,
  "title": "string|null",
  "description": "string|null",
  "recorded_at": 0,
  "created_by_user_id": "Id<users>",
  "created_at": 0,
  "updated_at": 0
}
```

**Contract Client↔Trainer (lectura)**  
json  

```json
{
  "_id": "Id<client_trainer_contracts>",
  "client_id": "Id<clients>",
  "trainer_id": "Id<trainers>",
  "status": "ACTIVE|ENDED|BLOCKED",
  "start_at": 0,
  "end_at": 0,
  "notes": "string|null",
  "created_by_user_id": "Id<users>",
  "created_at": 0,
  "updated_at": 0
}
```

---

## 🧑‍🏫 Admin — Endpoints

**1) getUserProfileById (QUERY)**  
Path: `profiles/admin/queries:getUserProfileById`  
Rol: ADMIN o SUPER_ADMIN

**Args:**  
json  

```json
{ "payload": { "user_id": "Id<users>" } }
```

**Respuesta (resumen):**  
json  

```json
{
  "status": "success",
  "value": {
    "user": { "...users" },
    "person": { "...persons" } | null,
    "roles": [ "...role_assignments" ],
    "client": { "...clients" } | null,
    "trainer": { "...trainers" } | null,
    "admin": { "...admins" } | null,
    "preferences": { "...client_preferences" } | null,
    "latestHealth": { "...client_health_metrics" } | null,
    "activeContracts": [ "...client_trainer_contracts" ]
  }
}
```

Errores: FORBIDDEN, NOT_FOUND, VALIDATION_ERROR.

**2) adminSetClientContract (MUTATION)**  
Path: `profiles/admin/mutations:adminSetClientContract`  
Rol: ADMIN o SUPER_ADMIN  
Regla: no duplicar ACTIVE para misma pareja (client_id, trainer_id).

**Args:**  
json  

```json
{
  "payload": {
    "client_id": "Id<clients>",
    "trainer_id": "Id<trainers>",
    "status": "ACTIVE|BLOCKED|ENDED",
    "start_at": 0,
    "end_at": 0,
    "notes": "string|null"
  }
}
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "Id<client_trainer_contracts>" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

---

## 👟 Trainer — Endpoints

**1) getMyTrainerProfile (QUERY)**  
Path: `profiles/trainer/queries:getMyTrainerProfile`  
Rol: TRAINER

**Args:** `{}` (sin payload)

**Respuesta:**  
json  

```json
{
  "status": "success",
  "value": {
    "trainer": { "...trainers" } | null,
    "person": { "...persons" } | null
  }
}
```

Errores: FORBIDDEN.

**2) updateTrainerSpecialties (MUTATION)**  
Path: `profiles/trainer/mutations:updateTrainerSpecialties`  
Rol: TRAINER

**Args:**  
json  

```json
{ "payload": { "specialties": ["string", "string"] } }
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "ok" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

**3) updateTrainerSchedule (MUTATION)**  
Path: `profiles/trainer/mutations:updateTrainerSchedule`  
Rol: TRAINER

**Args:**  
json  

```json
{ "payload": { "work_schedule": { "monday": { "start": "07:00", "end": "11:00" } } } }
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "ok" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

**4) updateMyPhone (MUTATION)**  
Path: `profiles/trainer/mutations:updateMyPhone`  
Rol: TRAINER

**Args:**  
json  

```json
{ "payload": { "phone": "+57 3001234567" } }
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "ok" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

---

## 🧘 Client — Endpoints

**1) getMyClientProfile (QUERY)**  
Path: `profiles/client/queries:getMyClientProfile`  
Rol: CLIENT

**Args:** `{}`

**Respuesta:**  
json  

```json
{
  "status": "success",
  "value": {
    "person": { "...persons" } | null,
    "client": { "...clients" } | null,
    "preferences": { "...client_preferences" } | null,
    "latestHealth": { "...client_health_metrics" } | null
  }
}
```

Errores: FORBIDDEN.

**2) upsertClientPreferences (MUTATION)**  
Path: `profiles/client/mutations:upsertClientPreferences`  
Rol: CLIENT

**Args:**  
json  

```json
{
  "payload": {
    "preferred_time_range": { "start": "06:00", "end": "08:00" },
    "routine_type": "MIXTO",
    "goal": "TONIFICAR",
    "notes": "texto"
  }
}
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "Id<client_preferences>" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

**3) addHealthMetric (MUTATION)**  
Path: `profiles/client/mutations:addHealthMetric`  
Rol: CLIENT

**Args:**  
json  

```json
{
  "payload": {
    "measured_at": 0,
    "weight_kg": 74.5,
    "height_cm": 178,
    "bmi": 23.5,
    "body_fat_pct": 15.2,
    "notes": "opcional"
  }
}
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "Id<client_health_metrics>" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

**4) listHealthMetrics (QUERY) — paginación simple**  
Path: `profiles/client/queries:listHealthMetrics`  
Rol: CLIENT

**Args (todas opcionales):**  
json  

```json
{
  "payload": {
    "from": 0,
    "to": 9999999999999,
    "cursor": 0,
    "limit": 20
  }
}
```

**Respuesta:**  
json  

```json
{
  "status": "success",
  "value": {
    "items": [ { "...HealthMetric" }, "..." ],
    "nextCursor": 1712345678901
  }
}
```

**Notas de paginación:** `cursor` y `nextCursor` son *timestamps* (`measured_at`). Si `nextCursor` es `null`, no hay más páginas.

Errores: FORBIDDEN, VALIDATION_ERROR.

**5) addProgress (MUTATION)**  
Path: `profiles/client/mutations:addProgress`  
Rol: CLIENT

**Args:**  
json  

```json
{
  "payload": {
    "kind": "MEDICION|HITO|RUTINA",
    "metric_key": "string",
    "metric_value": 123,
    "title": "string",
    "description": "string",
    "recorded_at": 0
  }
}
```

**Respuesta:**  
json  

```json
{ "status": "success", "value": "Id<client_progress>" }
```

Errores: FORBIDDEN, VALIDATION_ERROR.

**6) listProgress (QUERY) — paginación simple**  
Path: `profiles/client/queries:listProgress`  
Rol: CLIENT

**Args:**  
json  

```json
{
  "payload": {
    "from": 0,
    "to": 9999999999999,
    "cursor": 0,
    "limit": 20
  }
}
```

**Respuesta:**  
json  

```json
{
  "status": "success",
  "value": {
    "items": [ { "...Progress" }, "..." ],
    "nextCursor": 1712345678901
  }
}
```

**Notas:** `cursor` y `nextCursor` son *timestamps* (`recorded_at`).

Errores: FORBIDDEN, VALIDATION_ERROR.

**7) listMyContracts (QUERY)**  
Path: `profiles/client/queries:listMyContracts`  
Rol: CLIENT

**Args:**  
json  

```json
{
  "payload": {
    "status": "ACTIVE|ENDED|BLOCKED|null",
    "limit": 20,
    "cursor": 0
  }
}
```

**Respuesta:**  
json  

```json
{
  "status": "success",
  "value": {
    "items": [ { "...Contract" }, "..." ],
    "nextCursor": null
  }
}
```

Errores: FORBIDDEN, VALIDATION_ERROR.

---

## 🧩 Errores y manejo recomendado en Front

- **401/UNAUTHORIZED**: redirigir a login.
- **403/FORBIDDEN**: toast “No tienes permisos” y bloquear UI del flujo.
- **404/NOT_FOUND**: mostrar “No se encontró información” y ofrecer crear/editar si aplica.
- **VALIDATION_ERROR**: mostrar mensaje claro (“Revisa los campos”), resaltar inputs.
- **409 (lógico)**: p. ej. intento de duplicar ACTIVE en `adminSetClientContract`. Mostrar “Ya existe un contrato activo”.

> Nota: Si el path es incorrecto, Convex responde **404 Not Found**. Si hay un `throw` dentro de la función, Convex devolverá un error JSON; manejar `status != "success"`.

---

## 🔧 Variables de entorno (Front y Postman)

- `CONVEX_URL`: URL del despliegue Convex.
- `JWT_SUPER`, `JWT_ADMIN`, `JWT_TRAINER`, `JWT_CLIENT`: tokens Clerk por rol para probar.

*(Backend ya configurado previamente; no se añadieron nuevas .env en este sprint).*

---

## 🧑‍💻 Mini-guía de integración Front

- **Headers**: siempre enviar `Authorization: Bearer <JWT>` del usuario logueado.
- **Rutas**: usar `/api/query` o `/api/mutation` con body `{ path, args, format: "json" }`.
- **Campos editables por rol**:
  - **TRAINER**: `specialties`, `work_schedule`, `person.phone`.
  - **CLIENT**: `client_preferences`, `client_health_metrics`, `client_progress` (crear y listar).
  - **ADMIN/SUPER_ADMIN**: set de contratos Client↔Trainer y lectura de cualquier perfil.
- **DTOs clave en UI**:
  - `TrainerProfileDTO` (query `getMyTrainerProfile`): `{ trainer, person }`
  - `ClientProfileDTO` (query `getMyClientProfile`): `{ person, client, preferences, latestHealth }`
  - `AdminProfileDTO` (query `getUserProfileById`): `{ user, person, roles, client, trainer, admin, preferences, latestHealth, activeContracts }`
- **Paginación**:
  - `listHealthMetrics` y `listProgress` devuelven `{ items, nextCursor }`. Enviar de vuelta `cursor=nextCursor` para la siguiente página.
- **Estados/UI**:
  - Deshabilitar botones si el rol no califica (ocultar o inhabilitar).
  - Mostrar mensajes de error del backend (validation/forbidden).
- **Optimistic UI**: permitido en preferencias/métricas, con rollback si falla.
