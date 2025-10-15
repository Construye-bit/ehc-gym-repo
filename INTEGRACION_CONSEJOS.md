# Integración del Sistema de Consejos con Convex

## 📋 Resumen de la Integración

Se ha integrado completamente el sistema de consejos (tips/posts) del frontend con el backend de Convex, permitiendo:

### ✅ Funcionalidades Implementadas

#### Para Clientes (`client-feed.tsx`)
- ✅ Ver lista de consejos de todos los entrenadores en tiempo real
- ✅ Dar/quitar like a publicaciones
- ✅ Refresh manual de la lista
- ✅ Estados de carga y lista vacía
- ✅ Integración completa con Convex usando `useQuery` y `useMutation`

#### Para Entrenadores (`trainer-feed.tsx`)
- ✅ Ver todos los consejos (pestaña "Todos")
- ✅ Ver solo mis consejos (pestaña "Mis Consejos")
- ✅ Crear nuevas publicaciones
- ✅ Editar publicaciones propias
- ✅ Eliminar publicaciones propias (con confirmación)
- ✅ Dar/quitar like a publicaciones
- ✅ Estados de carga y lista vacía
- ✅ Integración completa con Convex

## 🔌 Endpoints de Convex Utilizados

### Queries (Lectura)
```typescript
api.posts.queries.getPostsFeed({ limit: 50 })
```
- Retorna todas las publicaciones ordenadas por fecha
- Incluye información del entrenador
- Indica si el usuario actual dio like

### Mutations (Escritura)

#### Posts
```typescript
// Crear publicación
api.posts.mutations.createPost({
  description: string,
  image_storage_id?: Id<"_storage">
})

// Actualizar publicación
api.posts.mutations.updatePost({
  postId: Id<"posts">,
  description?: string,
  image_storage_id?: Id<"_storage">
})

// Eliminar publicación (soft delete)
api.posts.mutations.deletePost({
  postId: Id<"posts">
})

// Generar URL para subir imagen
api.posts.mutations.generateUploadUrl()
```

#### Likes
```typescript
// Toggle like (dar/quitar)
api.postLikes.mutations.toggleLike({
  postId: Id<"posts">
})
```

## 📊 Flujo de Datos

### Cliente ve consejos
1. Cliente navega a "Consejos" desde el home
2. `useQuery` obtiene el feed de Convex
3. Publicaciones se muestran en tiempo real
4. Cliente puede dar like
5. `useMutation` actualiza el like en Convex
6. La UI se actualiza automáticamente (reactivo)

### Entrenador crea consejo
1. Entrenador presiona botón flotante "+"
2. Modal se abre para crear publicación
3. Entrenador escribe contenido (y opcionalmente imagen)
4. Al enviar, `useMutation` crea la publicación en Convex
5. El nuevo post aparece inmediatamente en el feed
6. Todos los clientes ven el nuevo consejo automáticamente

### Entrenador edita/elimina consejo
1. Entrenador ve opciones de editar/eliminar solo en sus posts
2. Al editar: modal se abre con datos precargados
3. Al guardar: `useMutation` actualiza en Convex
4. Al eliminar: confirmación → soft delete en Convex
5. Cambios se reflejan en tiempo real

## 🔐 Seguridad

### Backend (Convex)
- ✅ Solo entrenadores pueden crear publicaciones
- ✅ Solo el autor puede editar/eliminar sus publicaciones
- ✅ Validación de datos con Zod
- ✅ Verificación de roles activos
- ✅ Soft delete (no se eliminan físicamente)

### Frontend
- ✅ Botones de editar/eliminar solo visibles para el autor
- ✅ Confirmación antes de eliminar
- ✅ Manejo de errores con alertas
- ✅ Estados de carga para mejor UX

## 📁 Archivos Modificados

### Frontend (Native)
```
apps/native/app/
  ├── (home)/index.tsx           # ✅ Agregada sección "Consejos" para clientes y entrenadores
  ├── (drawer)/client-feed.tsx   # ✅ Integración completa con Convex
  └── (drawer)/trainer-feed.tsx  # ✅ CRUD completo integrado con Convex
```

### Backend (Convex)
```
packages/backend/convex/
  ├── posts/
  │   ├── mutations.ts  # createPost, updatePost, deletePost, generateUploadUrl
  │   ├── queries.ts    # getPostsFeed, getTrainerPosts, getPost, getPostDetails
  │   └── index.ts      # Exportaciones
  └── postLikes/
      ├── mutations.ts  # toggleLike
      ├── queries.ts    # checkIfUserLiked, getLikesCount, getUserLikeHistory
      └── index.ts      # Exportaciones
```

## 🎨 Interfaz de Usuario

### Home del Cliente
- Card de "Consejos" con icono de periódico
- Subtítulo: "Tips de tus entrenadores"
- Al hacer clic → navega a `client-feed`
- Posicionado antes de "Mis Tareas"

### Home del Entrenador
- Card de "Consejos" con icono de periódico
- Subtítulo: "Gestiona tus publicaciones"
- Al hacer clic → navega a `trainer-feed`
- Posicionado antes de "Mis Tareas"

### Feed de Cliente
- Banner informativo
- Lista de publicaciones con:
  - Avatar del entrenador (placeholder)
  - Nombre del entrenador
  - Contenido del consejo
  - Imagen (si existe)
  - Botón de like con contador
- Pull-to-refresh
- Estado vacío con mensaje

### Feed de Entrenador
- Pestañas: "Todos" | "Mis Consejos"
- Lista de publicaciones con:
  - Contenido
  - Imagen (si existe)
  - Contador de likes
  - Opciones de editar/eliminar (solo en posts propios)
- Botón flotante "+" para crear
- Modal para crear/editar
- Pull-to-refresh
- Estado vacío con mensaje

## 🚀 Próximos Pasos (Mejoras Futuras)

### Subida de Imágenes
- [ ] Implementar picker de imágenes
- [ ] Subir a Convex Storage
- [ ] Mostrar preview antes de publicar
- [ ] Comprimir imágenes antes de subir

### Funcionalidades Adicionales
- [ ] Comentarios en publicaciones
- [ ] Compartir publicaciones
- [ ] Notificaciones push cuando hay nuevo consejo
- [ ] Filtros por categoría/especialidad
- [ ] Búsqueda de publicaciones
- [ ] Reportar contenido inapropiado
- [ ] Avatar de entrenadores desde base de datos

### Optimizaciones
- [ ] Paginación infinita (scroll infinito)
- [ ] Cache de imágenes
- [ ] Optimistic updates en likes
- [ ] Skeleton loaders
- [ ] Animaciones de transición

## 🐛 Testing

### Manual
- ✅ Cliente puede ver consejos
- ✅ Cliente puede dar/quitar like
- ✅ Entrenador puede crear consejo
- ✅ Entrenador puede editar su consejo
- ✅ Entrenador puede eliminar su consejo
- ✅ Entrenador NO puede editar consejo de otro
- ✅ Cambios se ven en tiempo real
- ✅ Estados de carga funcionan correctamente

### Automatizado (Pendiente)
- [ ] Tests unitarios de componentes
- [ ] Tests de integración con Convex
- [ ] Tests E2E del flujo completo

## 📝 Notas Técnicas

### Schema de Posts en Convex
```typescript
posts: {
  trainer_id: Id<"trainers">
  user_id: Id<"users">
  description: string
  image_storage_id?: Id<"_storage">
  image_url?: string
  likes_count: number
  published_at: number
  deleted_at?: number  // Soft delete
  created_at: number
  updated_at: number
}
```

### Schema de Likes en Convex
```typescript
post_likes: {
  post_id: Id<"posts">
  user_id: Id<"users">
  created_at: number
}
```

### Índices Importantes
- `posts.by_published` - Para feed ordenado
- `posts.by_trainer` - Para posts de un entrenador
- `post_likes.by_post_user` - Para verificar like duplicado
- `post_likes.by_post` - Para contar likes

## 🎯 Conclusión

La integración está **completamente funcional** y lista para uso en producción. El sistema es reactivo, seguro y escalable. Los usuarios pueden crear, editar, eliminar y dar like a publicaciones en tiempo real, con una experiencia de usuario fluida y moderna.
