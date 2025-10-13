// convex/posts/index.ts

/**
 * Exportaciones centralizadas del módulo de posts
 */

// Mutations
export {
    createPost,
    updatePost,
    deletePost,
    generateUploadUrl,
} from './mutations';

// Queries
export {
    getPost,
    getPostsFeed,
    getTrainerPosts,
    getPostDetails,
} from './queries';

// Validations
export type {
    CreatePostData,
    UpdatePostData,
    DeletePostData,
    GetPostData,
    GetPostsFeedData,
    GetTrainerPostsData,
} from './validations';

// Errors
export {
    PostError,
    PostNotFoundError,
    UnauthorizedPostActionError,
    InvalidPostDataError,
    PostImageError,
} from './errors';