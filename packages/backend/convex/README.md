# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// functions.js
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.functions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// functions.js
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get(id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.functions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result),
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.
# 📚 Backend API Documentation - Posts & Likes Module

> **Versión:** 1.0.0  
> **Última actualización:** Octubre 2025  
> **Módulos:** `posts`, `postLikes`

---

## 📋 Tabla de Contenidos

1. [Resumen de Endpoints](#-resumen-de-endpoints)
2. [Autenticación](#-autenticación)
3. [Posts - Mutations](#-posts---mutations)
4. [Posts - Queries](#-posts---queries)
5. [Likes - Mutations](#-likes---mutations)
6. [Likes - Queries](#-likes---queries)
7. [Gestión de Imágenes](#-gestión-de-imágenes)
8. [Paginación](#-paginación)
9. [Validaciones y Límites](#-validaciones-y-límites)
10. [Manejo de Errores](#-manejo-de-errores)
11. [Ejemplos Completos](#-ejemplos-completos)
12. [Variables de Entorno](#-variables-de-entorno)
13. [TODO / Known Issues](#-todo--known-issues)

---

## 🎯 Resumen de Endpoints

### Posts
| Función | Tipo | Descripción | Autenticación |
|---------|------|-------------|---------------|
| `generateUploadUrl` | Mutation | Generar URL para subir imagen | ✅ Trainer |
| `createPost` | Mutation | Crear nueva publicación | ✅ Trainer |
| `updatePost` | Mutation | Actualizar publicación existente | ✅ Owner |
| `deletePost` | Mutation | Eliminar publicación (soft delete) | ✅ Owner |
| `getPost` | Query | Obtener publicación por ID | ❌ |
| `getPostsFeed` | Query | Feed paginado de publicaciones | ❌ |
| `getTrainerPosts` | Query | Publicaciones de un trainer | ❌ |
| `getPostDetails` | Query | Detalles completos de publicación | ❌ |

### Likes
| Función | Tipo | Descripción | Autenticación |
|---------|------|-------------|---------------|
| `toggleLike` | Mutation | Dar/quitar like (toggle) | ✅ Required |
| `checkIfUserLiked` | Query | Verificar si usuario dio like | ✅ Required |
| `getLikesCount` | Query | Obtener contador de likes | ❌ |
| `getUserLikeHistory` | Query | Historial de likes del usuario | ✅ Required |

---

## 🔐 Autenticación

Todas las requests deben incluir el token de autenticación de **Clerk** en el header:

```typescript
// Convex Client Setup
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  auth: {
    // Clerk maneja esto automáticamente
  }
});
```

**Roles requeridos:**
- **TRAINER**: Puede crear, editar y eliminar sus propias publicaciones
- **Cualquier usuario autenticado**: Puede dar likes
- **Público**: Puede ver publicaciones sin autenticación

---

## 📝 Posts - Mutations

### 1. `generateUploadUrl`

Genera una URL temporal para subir imágenes al storage de Convex.

**Firma:**
```typescript
generateUploadUrl(): Promise<string>
```

**Request:**
```typescript
const uploadUrl = await convex.mutation(api.posts.generateUploadUrl);
```

**Response:**
```typescript
"https://convex-storage.com/upload?token=abc123..."
```

**Permisos:** Solo **TRAINER** activo

**Errores:**
- `UnauthorizedPostActionError`: Usuario no es trainer o no está autenticado

---

### 2. `createPost`

Crea una nueva publicación.

**Firma:**
```typescript
createPost(args: {
  description: string;
  image_storage_id?: Id<"_storage">;
}): Promise<{
  success: boolean;
  data: {
    postId: Id<"posts">;
    message: string;
  };
}>
```

**Request:**
```typescript
const result = await convex.mutation(api.posts.createPost, {
  description: "¡Nueva rutina de entrenamiento! 💪",
  image_storage_id: "kg2h4j5k6l7m8n9o0p1q2r3s" // opcional
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "posts_kg2h4j5k6l7m8n9o0p1q2r3s",
    "message": "Publicación creada exitosamente"
  }
}
```

**Validaciones:**
- `description`: 1-1000 caracteres, requerido
- `image_storage_id`: ID válido de storage (opcional)

**Permisos:** Solo **TRAINER** activo

**Errores:**
- `UnauthorizedPostActionError`: No es trainer o trainer inactivo
- `InvalidPostDataError`: Datos de entrada inválidos

---

### 3. `updatePost`

Actualiza una publicación existente.

**Firma:**
```typescript
updatePost(args: {
  postId: Id<"posts">;
  description?: string;
  image_storage_id?: Id<"_storage">;
}): Promise<{
  success: boolean;
  message: string;
}>
```

**Request:**
```typescript
const result = await convex.mutation(api.posts.updatePost, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s",
  description: "Descripción actualizada"
});
```

**Response:**
```json
{
  "success": true,
  "message": "Publicación actualizada exitosamente"
}
```

**Permisos:** Solo el **creador** del post

**Errores:**
- `UnauthorizedPostActionError`: No es el creador del post
- `PostNotFoundError`: Post no existe
- `InvalidPostDataError`: No se puede editar post eliminado

---

### 4. `deletePost`

Elimina una publicación (soft delete).

**Firma:**
```typescript
deletePost(args: {
  postId: Id<"posts">;
}): Promise<{
  success: boolean;
  message: string;
}>
```

**Request:**
```typescript
const result = await convex.mutation(api.posts.deletePost, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response:**
```json
{
  "success": true,
  "message": "Publicación eliminada exitosamente"
}
```

**Nota:** Es un **soft delete**, el post no se elimina físicamente sino que se marca con `deleted_at`.

**Permisos:** Solo el **creador** del post

---

## 🔍 Posts - Queries

### 1. `getPost`

Obtiene una publicación específica por ID.

**Firma:**
```typescript
getPost(args: {
  postId: Id<"posts">;
}): Promise<{
  _id: Id<"posts">;
  trainer_id: Id<"trainers">;
  user_id: Id<"users">;
  description: string;
  image_url?: string;
  likes_count: number;
  published_at: number;
  created_at: number;
  updated_at: number;
  trainer_name: string;
  trainer_specialties: string[];
  user_has_liked: boolean;
}>
```

**Request:**
```typescript
const post = await convex.query(api.posts.getPost, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response:**
```json
{
  "_id": "posts_kg2h4j5k6l7m8n9o0p1q2r3s",
  "trainer_id": "trainers_abc123",
  "user_id": "users_xyz789",
  "description": "Nueva rutina de piernas 🔥",
  "image_url": "https://convex-storage.com/image.jpg",
  "likes_count": 42,
  "published_at": 1698765432000,
  "created_at": 1698765432000,
  "updated_at": 1698765432000,
  "trainer_name": "Carlos Pérez",
  "trainer_specialties": ["Fitness", "CrossFit"],
  "user_has_liked": true
}
```

**Campos especiales:**
- `user_has_liked`: `true` si el usuario actual dio like, `false` en caso contrario (o si no está autenticado)
- `trainer_name`: Nombre completo del trainer (concatenado)
- `image_url`: URL pública de la imagen (generada automáticamente)

**Errores:**
- `PostNotFoundError`: Post no existe o está eliminado

---

### 2. `getPostsFeed`

Obtiene el feed paginado de publicaciones (todas las sedes).

**Firma:**
```typescript
getPostsFeed(args?: {
  limit?: number;
  cursor?: number;
}): Promise<{
  posts: PostEnriched[];
  nextCursor: number | null;
}>
```

**Request:**
```typescript
// Primera página
const feed = await convex.query(api.posts.getPostsFeed, {
  limit: 20
});

// Página siguiente
const nextPage = await convex.query(api.posts.getPostsFeed, {
  limit: 20,
  cursor: feed.nextCursor
});
```

**Response:**
```json
{
  "posts": [
    {
      "_id": "posts_1",
      "description": "Entrenamiento de hoy 💪",
      "image_url": "https://...",
      "likes_count": 15,
      "published_at": 1698765432000,
      "trainer_name": "Ana García",
      "trainer_specialties": ["Yoga", "Pilates"],
      "user_has_liked": false
    }
  ],
  "nextCursor": 1698765430000
}
```

**Defaults:**
- `limit`: 20 (rango: 1-50)
- `cursor`: null (primera página)

**Orden:** Descendente por `published_at` (más recientes primero)

---

### 3. `getTrainerPosts`

Obtiene publicaciones de un trainer específico (paginado).

**Firma:**
```typescript
getTrainerPosts(args: {
  trainerId: Id<"trainers">;
  limit?: number;
  cursor?: number;
}): Promise<{
  posts: PostEnriched[];
  nextCursor: number | null;
}>
```

**Request:**
```typescript
const trainerPosts = await convex.query(api.posts.getTrainerPosts, {
  trainerId: "trainers_abc123",
  limit: 10
});
```

**Response:** Igual que `getPostsFeed`

**Errores:**
- `Error`: Entrenador no encontrado

---

### 4. `getPostDetails`

Obtiene detalles completos de una publicación (incluye info del trainer, persona, usuario y sede).

**Firma:**
```typescript
getPostDetails(args: {
  postId: Id<"posts">;
}): Promise<PostDetailsFull>
```

**Request:**
```typescript
const details = await convex.query(api.posts.getPostDetails, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response:**
```json
{
  "_id": "posts_kg2h4j5k6l7m8n9o0p1q2r3s",
  "description": "Nueva rutina",
  "image_url": "https://...",
  "likes_count": 42,
  "published_at": 1698765432000,
  "trainer": {
    "_id": "trainers_abc123",
    "employee_code": "EMP001",
    "specialties": ["Fitness"],
    "status": "ACTIVE"
  },
  "person": {
    "name": "Carlos",
    "last_name": "Pérez"
  },
  "user": {
    "name": "Carlos Pérez",
    "email": "carlos@gym.com"
  },
  "branch": {
    "name": "Sede Centro"
  },
  "user_has_liked": true
}
```

---

## ❤️ Likes - Mutations

### 1. `toggleLike`

Da o quita like a una publicación (toggle transaccional).

**Firma:**
```typescript
toggleLike(args: {
  postId: Id<"posts">;
}): Promise<{
  success: boolean;
  action: "liked" | "unliked";
  likesCount: number;
}>
```

**Request:**
```typescript
const result = await convex.mutation(api.postLikes.toggleLike, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response (like):**
```json
{
  "success": true,
  "action": "liked",
  "likesCount": 43
}
```

**Response (unlike):**
```json
{
  "success": true,
  "action": "unliked",
  "likesCount": 42
}
```

**Comportamiento:**
- Si no existe like → crea like y incrementa contador
- Si existe like → elimina like y decrementa contador
- **Transaccional**: El contador siempre está sincronizado

**Permisos:** Requiere autenticación

**Errores:**
- `Error`: Usuario no autenticado
- `Error`: Publicación no encontrada o eliminada

---

## 🔍 Likes - Queries

### 1. `checkIfUserLiked`

Verifica si el usuario actual dio like a una publicación.

**Firma:**
```typescript
checkIfUserLiked(args: {
  postId: Id<"posts">;
}): Promise<boolean>
```

**Request:**
```typescript
const hasLiked = await convex.query(api.postLikes.checkIfUserLiked, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response:**
```typescript
true  // o false
```

**Nota:** Retorna `false` si el usuario no está autenticado.

---

### 2. `getLikesCount`

Obtiene el contador de likes de una publicación (público).

**Firma:**
```typescript
getLikesCount(args: {
  postId: Id<"posts">;
}): Promise<number>
```

**Request:**
```typescript
const count = await convex.query(api.postLikes.getLikesCount, {
  postId: "posts_kg2h4j5k6l7m8n9o0p1q2r3s"
});
```

**Response:**
```typescript
42
```

---

### 3. `getUserLikeHistory`

Obtiene el historial de likes del usuario actual.

**Firma:**
```typescript
getUserLikeHistory(args?: {
  limit?: number;
}): Promise<Array<{
  like_id: Id<"post_likes">;
  liked_at: number;
  post: {
    _id: Id<"posts">;
    description: string;
    image_url?: string;
    likes_count: number;
    published_at: number;
    trainer_name: string;
  };
}>>
```

**Request:**
```typescript
const history = await convex.query(api.postLikes.getUserLikeHistory, {
  limit: 50
});
```

**Response:**
```json
[
  {
    "like_id": "post_likes_xyz",
    "liked_at": 1698765432000,
    "post": {
      "_id": "posts_abc",
      "description": "Rutina increíble",
      "image_url": "https://...",
      "likes_count": 100,
      "published_at": 1698765000000,
      "trainer_name": "Ana García"
    }
  }
]
```

**Defaults:**
- `limit`: 50

**Nota:** Filtra automáticamente posts eliminados (retorna `null` si el post ya no existe).

---

## 🖼️ Gestión de Imágenes

### Flujo completo de subida de imagen

```typescript
// 1. Obtener URL de subida (requiere ser TRAINER)
const uploadUrl = await convex.mutation(api.posts.generateUploadUrl);

// 2. Subir imagen al storage
const file = new File([blob], "image.jpg", { type: "image/jpeg" });
const response = await fetch(uploadUrl, {
  method: "POST",
  body: file,
});

// 3. Obtener storageId de la respuesta
const { storageId } = await response.json();

// 4. Crear post con el storageId
const post = await convex.mutation(api.posts.createPost, {
  description: "Mi nueva publicación",
  image_storage_id: storageId
});
```

### ⚠️ Importante sobre imágenes

1. **El backend almacena:**
   - `image_storage_id`: ID interno de Convex Storage
   - `image_url`: URL pública generada automáticamente

2. **El frontend recibe:**
   - `image_url`: URL lista para mostrar en `<img src={post.image_url} />`

3. **Conversión automática:**
   - Al crear/actualizar post, el backend convierte `image_storage_id` → `image_url`
   - El frontend **nunca** necesita el `storageId` después de crear el post

### Límites de imágenes

**⚠️ PENDIENTE DE CONFIGURACIÓN**

Actualmente no hay validaciones en el backend. Sugerencias:

```typescript
// TODO: Implementar en el backend
const IMAGE_LIMITS = {
  maxSize: 5 * 1024 * 1024,        // 5 MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp"
  ],
  maxImagesPerPost: 1               // Solo 1 imagen por post
};
```

**Recomendación:** Validar en el frontend antes de subir.

---

## 📄 Paginación

### Cómo funciona el cursor

El sistema usa **cursor-based pagination** con timestamps:

```typescript
interface PaginationParams {
  limit?: number;    // Cantidad de items (default: 20, max: 50)
  cursor?: number;   // Timestamp del último item de la página anterior
}

interface PaginationResponse<T> {
  posts: T[];
  nextCursor: number | null;  // null = no hay más páginas
}
```

### Ejemplo de implementación (React)

```typescript
function PostsFeed() {
  const [cursor, setCursor] = useState<number | null>(null);
  const feed = useQuery(api.posts.getPostsFeed, { 
    limit: 20,
    cursor: cursor ?? undefined 
  });

  const loadMore = () => {
    if (feed?.nextCursor) {
      setCursor(feed.nextCursor);
    }
  };

  return (
    <div>
      {feed?.posts.map(post => <PostCard key={post._id} post={post} />)}
      {feed?.nextCursor && (
        <button onClick={loadMore}>Cargar más</button>
      )}
    </div>
  );
}
```

### Orden de resultados

- `getPostsFeed`: Ordenado por `published_at` DESC (más recientes primero)
- `getTrainerPosts`: Ordenado por `published_at` DESC
- `getUserLikeHistory`: Ordenado por `created_at` DESC (likes más recientes)

---

## ⚠️ Validaciones y Límites

### Posts

| Campo | Regla | Mensaje de error |
|-------|-------|------------------|
| `description` | 1-1000 caracteres, requerido | "La descripción es requerida" / "No puede exceder 1000 caracteres" |
| `image_storage_id` | ID válido de storage (opcional) | "El ID de la imagen es requerido" |
| `limit` (feed) | 1-50 | "El límite debe ser al menos 1" / "No puede exceder 50" |

### Roles y permisos

| Acción | Rol requerido | Validaciones adicionales |
|--------|---------------|-------------------------|
| Crear post | TRAINER activo | Trainer debe tener `status: "ACTIVE"` |
| Editar post | Owner | Post no debe estar eliminado |
| Eliminar post | Owner | - |
| Dar like | Autenticado | Post no debe estar eliminado |
| Ver posts | Público | - |

---

## 🚨 Manejo de Errores

### Tipos de errores

```typescript
// Errores personalizados del módulo
class PostError extends Error {}
class PostNotFoundError extends PostError {}
class UnauthorizedPostActionError extends PostError {}
class InvalidPostDataError extends PostError {}
class PostImageError extends PostError {}
```

### Errores comunes y cómo manejarlos

#### 1. `UnauthorizedPostActionError`

**Causa:** Usuario no tiene permisos

```typescript
try {
  await convex.mutation(api.posts.createPost, { ... });
} catch (error) {
  if (error.message.includes("Se requiere rol de TRAINER")) {
    // Mostrar: "Solo los entrenadores pueden crear publicaciones"
  }
}
```

#### 2. `PostNotFoundError`

**Causa:** Post no existe o fue eliminado

```typescript
try {
  await convex.query(api.posts.getPost, { postId: "..." });
} catch (error) {
  if (error.message.includes("no encontrada")) {
    // Redirigir al feed o mostrar 404
  }
}
```

#### 3. `InvalidPostDataError`

**Causa:** Datos de entrada inválidos

```typescript
try {
  await convex.mutation(api.posts.createPost, {
    description: "" // ❌ Vacío
  });
} catch (error) {
  // Mostrar mensaje de validación al usuario
  toast.error(error.message);
}
```

### Estructura de error estándar

```typescript
{
  message: string;           // Mensaje descriptivo
  name: string;              // Tipo de error
  stack?: string;            // Stack trace (solo dev)
}
```

---

## 📚 Ejemplos Completos

### Ejemplo 1: Crear publicación con imagen

```typescript
async function createPostWithImage(description: string, imageFile: File) {
  try {
    // 1. Generar URL de subida
    const uploadUrl = await convex.mutation(api.posts.generateUploadUrl);
    
    // 2. Subir imagen
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: imageFile,
    });
    
    if (!uploadResponse.ok) {
      throw new Error("Error al subir imagen");
    }
    
    const { storageId } = await uploadResponse.json();
    
    // 3. Crear post
    const result = await convex.mutation(api.posts.createPost, {
      description,
      image_storage_id: storageId,
    });
    
    console.log("Post creado:", result.data.postId);
    return result;
    
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
```

### Ejemplo 2: Feed infinito con scroll

```typescript
function InfiniteFeed() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const feed = useQuery(
    api.posts.getPostsFeed,
    cursor === null ? { limit: 20 } : { limit: 20, cursor }
  );

  useEffect(() => {
    if (feed) {
      setAllPosts(prev => [...prev, ...feed.posts]);
      setHasMore(feed.nextCursor !== null);
      if (feed.nextCursor) {
        setCursor(feed.nextCursor);
      }
    }
  }, [feed]);

  return (
    <InfiniteScroll
      dataLength={allPosts.length}
      next={() => setCursor(cursor)}
      hasMore={hasMore}
      loader={<Spinner />}
    >
      {allPosts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </InfiniteScroll>
  );
}
```

### Ejemplo 3: Toggle like optimista

```typescript
function LikeButton({ postId, initialLikes, initialLiked }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    setLoading(true);

    try {
      const result = await convex.mutation(api.postLikes.toggleLike, {
        postId
      });

      // Sync con el servidor
      setLikes(result.likesCount);
      setLiked(result.action === "liked");
      
    } catch (error) {
      // Revertir en caso de error
      setLiked(!liked);
      setLikes(prev => liked ? prev + 1 : prev - 1);
      toast.error("Error al procesar like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={loading}>
      {liked ? "❤️" : "🤍"} {likes}
    </button>
  );
}
```

### Ejemplo 4: Perfil de trainer con sus posts

```typescript
function TrainerProfile({ trainerId }: { trainerId: Id<"trainers"> }) {
  const [cursor, setCursor] = useState<number | undefined>();
  
  const posts = useQuery(api.posts.getTrainerPosts, {
    trainerId,
    limit: 10,
    cursor
  });

  return (
    <div>
      <h2>Publicaciones del Entrenador</h2>
      
      {posts?.posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
      
      {posts?.nextCursor && (
        <button onClick={() => setCursor(posts.nextCursor!)}>
          Ver más
        </button>
      )}
    </div>
  );
}
```

---

## 🔧 Variables de Entorno

### Backend (Convex)

```bash
# .env.local en packages/backend/

# Clerk Authentication (requerido)
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CONVEX_SITE_URL=https://your-app.convex.site

# Convex Storage (configurado automáticamente)
# No se requieren variables adicionales para storage
```

### Frontend (Next.js)

```bash
# .env.local en packages/frontend/

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### Configuración de Storage en Convex Dashboard

1. Ir a **Settings → Storage**
2. Verificar que el storage esté habilitado
3. **No se requiere configuración adicional** - Convex maneja todo automáticamente

---

## 📋 TODO / Known Issues

### ⚠️ Pendientes de validar con Frontend

1. **Validación de imágenes en backend**
   - [ ] Implementar límite de tamaño máximo (sugerido: 5MB)
   - [ ] Validar tipos MIME permitidos (jpeg, png, webp)
   - [ ] Retornar errores descriptivos al frontend

2. **Formato de timestamps**
   - [ ] Confirmar si frontend prefiere `Date` o `number` (actualmente: `number`)
   - [ ] Documentar timezone (actualmente: UTC)

3. **Paginación**
   - [ ] Confirmar límite por defecto (actualmente: 20)
   - [ ] Definir límite máximo (actualmente: 50)

4. **Imágenes múltiples**
   - [ ] Actualmente solo soporta 1 imagen por post
   - [ ] ¿Se requiere soporte para múltiples imágenes?

5. **Notificaciones**
   - [ ] ¿Enviar notificación push cuando reciben like?
   - [ ] ¿Notificar al trainer cuando alguien comenta? (feature futura)

6. **Analytics**
   - [ ] ¿Trackear vistas de publicaciones?
   - [ ] ¿Métricas de engagement?

### 🐛 Known Issues

1. **Soft Delete Cascade**
   - Actualmente, eliminar un post NO elimina sus likes
   - Los likes quedan huérfanos en la DB
   - **Solución planeada:** Agregar cascade delete en `deletePost`

2. **Race Conditions en toggleLike**
   - Si el usuario hace click múltiple muy rápido, puede haber duplicados
   - **Mitigación actual:** El índice `by_post_user` previene duplicados en DB
   - **Recomendación:** Deshabilitar botón mientras está en loading

3. **Storage Cleanup**
   - Imágenes de posts eliminados NO se borran del storage
   - **Impacto:** Desperdicio de espacio
   - **Solución futura:** Implementar background job de limpieza

### 🔮 Features Futuras (no implementadas)

- [ ] Comentarios en publicaciones
- [ ] Compartir publicaciones
- [ ] Reportar contenido inapropiado
- [ ] Filtros de feed (por sede, por especialidad)
- [ ] Búsqueda de publicaciones
- [ ] Estadísticas para trainers (alcance, engagement)
- [ ] Stories (contenido temporal)

---

## 📞 Soporte

Para dudas o issues:
- **Slack:** #backend-support
- **Email:** backend-team@gym.com
- **Documentación Convex:** https://docs.convex.dev

---

**Última actualización:** Octubre 2025  
**Versión del API:** 1.0.0  
**Mantenedor:** Backend Team