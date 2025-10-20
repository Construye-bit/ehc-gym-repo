// convex/postLikes/index.ts

/**
 * Exportaciones centralizadas del módulo de postLikes
 */

// Mutations
export {
    toggleLike,
} from './mutations';

// Queries
export {
    checkIfUserLiked,
    getLikesCount,
    getUserLikeHistory,
} from './queries';

// Validations
export type {
    ToggleLikeData,
    CheckIfUserLikedData,
    GetLikesCountData,
} from './validations';