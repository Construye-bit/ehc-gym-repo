# Integración Backend → Frontend (Convex + Clerk)

Guía para consumir **mutations** y **queries** del backend. Incluye firmas, payloads, respuestas, validaciones/roles, ejemplos, variables de entorno, TODO y matriz de permisos.

**Base URL (Convex HTTP Functions)**
- POST https://<CONVEX_URL>/api/functions/<namespace>:<functionName>
- Ej.: https://vivid-elk-733.convex.cloud/api/functions/admins:getMyBranch

**Autenticación**
- Header: Authorization: Bearer <JWT de Clerk>
- En Convex → Authentication → Providers: configurar issuer (URL de Clerk) y audience (Application ID de Clerk)

**Envelope estándar de Convex**
- Éxito: { "status": "success", "value": <resultado> }
- Error:  { "status": "error",  "errorMessage": "..." }


## 1) Endpoints disponibles (firma, payload y respuesta)

### A) Admins (namespace: admins)

1) admins:createAdmin · Mutation
- Rol: SUPER_ADMIN
- Firma: (payload)
- Request
    POST /api/functions/admins:createAdmin
    Body:
      {
        "payload": {
          "person_id": "Id<persons>",
          "user_id": "Id<users>",
          "branch_id": "Id<branches> | null",
          "status": "ACTIVE" | "INACTIVE"
        }
      }
- Response
      { "status": "success", "value": "Id<admins>" }

2) admins:assignAdminToBranch · Mutation
- Rol: SUPER_ADMIN
- Regla: relación 1:1 (una branch con un admin activo)
- Request
    POST /api/functions/admins:assignAdminToBranch
    Body:
      { "payload": { "admin_id": "Id<admins>", "branch_id": "Id<branches>" } }
- Response
      { "status": "success", "value": "Id<admins>" }

3) admins:revokeAdminFromBranch · Mutation
- Rol: SUPER_ADMIN
- Request
    POST /api/functions/admins:revokeAdminFromBranch
    Body:
      { "payload": { "admin_id": "Id<admins>" } }
- Response
      { "status": "success", "value": "Id<admins>" }

4) admins:updateAdminStatus · Mutation
- Rol: SUPER_ADMIN
- Request
    POST /api/functions/admins:updateAdminStatus
    Body:
      { "payload": { "admin_id": "Id<admins>", "status": "ACTIVE" | "INACTIVE" } }
- Response
      { "status": "success", "value": "Id<admins>" }

5) admins:getAdmin · Query
- Rol: SUPER_ADMIN
- Request
    POST /api/functions/admins:getAdmin
    Body:
      { "payload": { "admin_id": "Id<admins>" } }
- Response
      { "status": "success", "value": { "_id": "Id<admins>", "...": "campos admin" } }

6) admins:listAdminsUnassigned · Query
- Rol: SUPER_ADMIN
- Request
    POST /api/functions/admins:listAdminsUnassigned
    Body:
      {}
- Response
      { "status": "success", "value": [ { "_id": "Id<admins>", "branch_id": null, "...": "otros" } ] }

7) admins:getAdminByUser · Query
- Rol: sesión válida (cualquier rol)
- Request
    POST /api/functions/admins:getAdminByUser
    Body:
      {}
- Response
      { "status": "success", "value": { "_id": "Id<admins>", "...": "campos admin" } | null }

8) admins:getMyBranch · Query
- Rol: ADMIN (logueado como ese admin)
- Request
    POST /api/functions/admins:getMyBranch
    Body:
      {}
- Response
      { "status": "success", "value": { "_id": "Id<branches>", "...": "campos branch" } | null }


### B) Clients (namespace: clients)

1) clients:createClient · Mutation
- Rol: SUPER_ADMIN o ADMIN
- Regla: no dos clientes ACTIVOS para la misma person_id
- Request
    POST /api/functions/clients:createClient
    Body:
      {
        "payload": {
          "person_id": "Id<persons>",
          "user_id": "Id<users> | null",
          "status": "ACTIVE" | "INACTIVE",
          "is_payment_active": true,
          "join_date": 1738799999999,
          "preferred_branch_id": "Id<branches> | null"
        }
      }
- Response
      { "status": "success", "value": "Id<clients>" }

2) clients:setClientPaymentActive · Mutation
- Rol: ADMIN (de la branch del cliente) o SUPER_ADMIN
- Request
    POST /api/functions/clients:setClientPaymentActive
    Body:
      { "payload": { "client_id": "Id<clients>", "is_payment_active": true } }
- Response
      { "status": "success", "value": "Id<clients>" }

3) clients:getClient · Query
- Rol: SUPER_ADMIN, ADMIN (branch del cliente) o dueño CLIENT
- Request
    POST /api/functions/clients:getClient
    Body:
      { "payload": { "client_id": "Id<clients>" } }
- Response
      { "status": "success", "value": { "_id": "Id<clients>", "...": "campos client" } }

4) clients:listClientsByBranch · Query
- Rol: ADMIN (de esa branch) o SUPER_ADMIN
- Request
    POST /api/functions/clients:listClientsByBranch
    Body:
      { "payload": { "branch_id": "Id<branches>", "status": "ACTIVE" | "INACTIVE" | null } }
- Response
      { "status": "success", "value": [ { "_id": "Id<clients>", "...": "campos client" } ] }


### C) Client ↔ Branch (namespace: client_branches)

1) client_branches:linkClientToBranch · Mutation
- Rol: ADMIN (de esa branch) o SUPER_ADMIN
- Regla: evita duplicado (mismo client_id + branch_id)
- Request
    POST /api/functions/client_branches:linkClientToBranch
    Body:
      { "payload": { "client_id": "Id<clients>", "branch_id": "Id<branches>" } }
- Response
      { "status": "success", "value": "Id<client_branches>" }

2) client_branches:unlinkClientFromBranch · Mutation
- Rol: ADMIN (de esa branch) o SUPER_ADMIN
- Request
    POST /api/functions/client_branches:unlinkClientFromBranch
    Body:
      { "payload": { "client_id": "Id<clients>", "branch_id": "Id<branches>" } }
- Response
      { "status": "success", "value": "Id<client_branches>" }


### D) Invitations (namespace: invitations)

1) invitations:inviteFriend · Mutation
- Rol: CLIENT
- Reglas: cliente con pago activo; crea invitación PENDING con token y expires_at (+10 días)
- Request
    POST /api/functions/invitations:inviteFriend
    Body:
      {
        "payload": {
          "inviter_client_id": "Id<clients>",
          "invitee_name": "string",
          "invitee_email": "string@email.com",
          "preferred_branch_id": "Id<branches> | null"
        }
      }
- Response
      {
        "status": "success",
        "value": {
          "invitationId": "Id<invitations>",
          "token": "string",
          "expires_at": 1738899999999
        }
      }

2) invitations:cancelInvitation · Mutation
- Rol: CLIENT (dueño de la invitación)
- Regla: solo si status = PENDING
- Request
    POST /api/functions/invitations:cancelInvitation
    Body:
      { "payload": { "invitation_id": "Id<invitations>" } }
- Response
      { "status": "success", "value": "Id<invitations>" }

3) invitations:listInvitationsByBranch · Query
- Rol: ADMIN (de esa branch) o SUPER_ADMIN
- Incluye: preferred_branch_id = branch y las de clientes que pertenecen a la branch (vía client_branches)
- Request
    POST /api/functions/invitations:listInvitationsByBranch
    Body:
      { "payload": { "branch_id": "Id<branches>" } }
- Response
      { "status": "success", "value": [ { "_id": "Id<invitations>", "...": "campos invitation" } ] }


## 2) Validaciones y límites (y manejo de errores)

- Validaciones (Zod)
  - Tipos, enums (status, role), formato email, longitudes, etc.
  - Error típico: "Validación fallida en <contexto>: <campo>: <mensaje>"

- RBAC / Permisos
  - SUPER_ADMIN: gestión global (admins, sedes, listados)
  - ADMIN: alcance por branch (su sede)
  - CLIENT: invitar/cancelar invitaciones propias (si pago activo)

- Reglas de negocio clave
  - Admin ↔ Branch 1:1 (una branch activa solo tiene un admin activo)
  - Clients por persona: no dos activos para la misma person_id
  - Invite Friend: requiere rol CLIENT + is_payment_active = true

- Manejo de errores en Front
  - "Acceso denegado: requiere rol ..." → toast + redirección según rol
  - "... no encontrado" (admin/client/branch) → notificación + refresco de listas
  - Duplicado client_branches → deshabilitar/ocultar acción si ya existe
  - Envelope de error (HTTP):
        { "status": "error", "errorMessage": "Mensaje legible para usuario/QA" }


## 3) Paginación

- Estado actual: listados devuelven arrays completos (sin cursor).
- Plan v2: agregar limit (number) y cursor (string | null) en el payload y responder:
      { "status": "success", "value": { "items": [ ... ], "nextCursor": "..." } }


## 4) Ejemplos completos (requests + responses)

- Headers comunes
      Authorization: Bearer <JWT Clerk>
      Content-Type: application/json

- admins:getMyBranch
      POST /api/functions/admins:getMyBranch
      {}
  Respuesta:
      {
        "status": "success",
        "value": { "_id": "br_123", "name": "Sede Centro", "status": "ACTIVE" }
      }

- admins:assignAdminToBranch
      POST /api/functions/admins:assignAdminToBranch
      { "payload": { "admin_id": "ad_1", "branch_id": "br_123" } }
  Respuesta:
      { "status": "success", "value": "ad_1" }

- clients:listClientsByBranch
      POST /api/functions/clients:listClientsByBranch
      { "payload": { "branch_id": "br_123", "status": "ACTIVE" } }
  Respuesta:
      {
        "status": "success",
        "value": [
          { "_id": "cl_1", "person_id": "p1", "is_payment_active": true },
          { "_id": "cl_2", "person_id": "p2", "is_payment_active": false }
        ]
      }

- clients:setClientPaymentActive
      POST /api/functions/clients:setClientPaymentActive
      { "payload": { "client_id": "cl_1", "is_payment_active": true } }
  Respuesta:
      { "status": "success", "value": "cl_1" }

- invitations:inviteFriend
      POST /api/functions/invitations:inviteFriend
      {
        "payload": {
          "inviter_client_id": "cl_1",
          "invitee_name": "Amigo Uno",
          "invitee_email": "amigo@ejemplo.com",
          "preferred_branch_id": "br_123"
        }
      }
  Respuesta:
      {
        "status": "success",
        "value": {
          "invitationId": "inv_1",
          "token": "ABC123TOKEN",
          "expires_at": 1738899999999
        }
      }

- client_branches:linkClientToBranch
      POST /api/functions/client_branches:linkClientToBranch
      { "payload": { "client_id": "cl_1", "branch_id": "br_123" } }
  Respuesta:
      { "status": "success", "value": "cb_1" }


## 5) Variables de entorno necesarias

- Frontend (Vite/React)
  - VITE_CONVEX_URL → p.ej. https://vivid-elk-733.convex.cloud
  - VITE_CLERK_PUBLISHABLE_KEY → inicializar Clerk y obtener JWTs

- Convex (backend)
  - Authentication → Providers:
    - Issuer: URL de tu instancia de Clerk (https://<sub>.clerk.accounts.dev)
    - Audience: Application ID de Clerk
  - (Opcional) Emails: RESEND_API_KEY si se habilita envío real de invitaciones


## 6) TODO / Known issues

- Paginación: pendiente cursor/limit en listados.
- Emails de invitación: wiring listo; activar con RESEND_API_KEY y plantillas.
- Rate limiting: recomendable para inviteFriend.
- Estructura de errores: hoy es texto; si front requiere { code, field }, estandarizar en v2.
- Campos extra: coordinar con front antes de extender schema (clients/admins).


## 7) Matriz de permisos (RBAC)

| Función                                     | SUPER_ADMIN | ADMIN (su branch) | CLIENT (dueño) |
|---------------------------------------------|-------------|-------------------|----------------|
| admins:createAdmin/assign/revoke/update     | ✅           | ❌                 | ❌              |
| admins:getAdmin / listAdminsUnassigned      | ✅           | ❌                 | ❌              |
| admins:getAdminByUser / getMyBranch         | ✅           | ✅                 | ❌              |
| clients:createClient                         | ✅           | ✅                 | ❌              |
| clients:setClientPaymentActive               | ✅           | ✅                 | ❌              |
| clients:getClient                            | ✅           | ✅                 | ✅              |
| clients:listClientsByBranch                  | ✅           | ✅                 | ❌              |
| client_branches:link/unlink                  | ✅           | ✅                 | ❌              |
| invitations:inviteFriend / cancelInvitation  | ❌           | ❌                 | ✅              |
| invitations:listInvitationsByBranch          | ✅           | ✅                 | ❌              |
