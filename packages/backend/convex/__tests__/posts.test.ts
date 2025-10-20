/* convex/__tests__/posts.test.ts */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeDB, makeCtx } from "./test_utils/fakeCtx";
import {
  seedUser,
  seedRole,
  seedPerson,
  seedTrainer,
  seedPost,
  seedPostLike,
} from "./test_utils/builders";
import * as PostMutations from "../posts/mutations";
import * as PostQueries from "../posts/queries";
import * as PostLikeMutations from "../postLikes/mutations";
import { runMutation, runQuery } from "./test_utils/run";

// Mock Convex runtime
vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
}));

describe("Posts: creación, consulta y likes", () => {
  let db: FakeDB;
  beforeEach(() => {
    db = new FakeDB();
  });

  it("createPost: solo trainers activos pueden crear publicaciones", async () => {
    const ctx = makeCtx(db);

    // Usuario con rol TRAINER
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "John",
      last_name: "Doe",
    });
    const trainer = seedTrainer(db, {
      person_id: tPerson,
      user_id: tUser,
      status: "ACTIVE",
    });

    // Autenticar como trainer
    db.setAuthUser("trainer1");

    // Crear post
    const result = await runMutation(PostMutations.createPost as any, ctx, {
      description: "Mi primer post",
      image_storage_id: undefined,
    });

    expect(result.success).toBe(true);
    expect(typeof result.data.postId).toBe("string");

    const post = db.get(result.data.postId);
    expect(post?.trainer_id).toBe(trainer);
    expect(post?.description).toBe("Mi primer post");
    expect(post?.likes_count).toBe(0);
  });

  it("createPost: falla si el usuario no es trainer", async () => {
    const ctx = makeCtx(db);

    // Usuario sin rol TRAINER
    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });

    db.setAuthUser("client1");

    await expect(
      runMutation(PostMutations.createPost as any, ctx, {
        description: "Intento de post",
      })
    ).rejects.toThrow();
  });

  it("getPost: devuelve data completa con user_has_liked", async () => {
    const ctx = makeCtx(db);

    // Setup: Trainer con post
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "John",
      last_name: "Doe",
    });
    const trainer = seedTrainer(db, { person_id: tPerson, user_id: tUser });
    const post = seedPost(db, {
      trainer_id: trainer,
      user_id: tUser,
      description: "Test post",
      likes_count: 1,
    });

    // Usuario que dio like
    const likerUser = seedUser(db, {
      clerk_id: "liker1",
      name: "Liker",
      email: "l@x.com",
    });
    seedPostLike(db, { post_id: post, user_id: likerUser });

    // Consultar como el usuario que dio like
    db.setAuthUser("liker1");

    const result = await runQuery(PostQueries.getPost as any, ctx, {
      postId: post,
    });

    expect(result._id).toBe(post);
    expect(result.description).toBe("Test post");
    expect(result.trainer_name).toBe("John Doe");
    expect(result.user_has_liked).toBe(true);
    expect(result.likes_count).toBe(1);
  });

  it("getPost: user_has_liked es false si no dio like", async () => {
    const ctx = makeCtx(db);

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "John",
      last_name: "Doe",
    });
    const trainer = seedTrainer(db, { person_id: tPerson, user_id: tUser });
    const post = seedPost(db, {
      trainer_id: trainer,
      user_id: tUser,
      likes_count: 0,
    });

    // Otro usuario sin like
    const otherUser = seedUser(db, {
      clerk_id: "other1",
      name: "Other",
      email: "o@x.com",
    });
    db.setAuthUser("other1");

    const result = await runQuery(PostQueries.getPost as any, ctx, {
      postId: post,
    });

    expect(result.user_has_liked).toBe(false);
  });

  it("toggleLike: like incrementa likesCount, unlike decrementa", async () => {
    const ctx = makeCtx(db);

    // Setup: Post con 0 likes
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "John",
      last_name: "Doe",
    });
    const trainer = seedTrainer(db, { person_id: tPerson, user_id: tUser });
    const post = seedPost(db, {
      trainer_id: trainer,
      user_id: tUser,
      likes_count: 0,
    });

    // Usuario que dará like
    const likerUser = seedUser(db, {
      clerk_id: "liker1",
      name: "Liker",
      email: "l@x.com",
    });
    db.setAuthUser("liker1");

    // Primer toggle: LIKE
    const result1 = await runMutation(
      PostLikeMutations.toggleLike as any,
      ctx,
      { postId: post }
    );
    expect(result1.success).toBe(true);
    expect(result1.action).toBe("liked");
    expect(result1.likesCount).toBe(1);

    const postAfterLike = db.get(post);
    expect(postAfterLike?.likes_count).toBe(1);

    // Segundo toggle: UNLIKE
    const result2 = await runMutation(
      PostLikeMutations.toggleLike as any,
      ctx,
      { postId: post }
    );
    expect(result2.success).toBe(true);
    expect(result2.action).toBe("unliked");
    expect(result2.likesCount).toBe(0);

    const postAfterUnlike = db.get(post);
    expect(postAfterUnlike?.likes_count).toBe(0);
  });

  it("toggleLike: no permite duplicados, mantiene consistencia", async () => {
    const ctx = makeCtx(db);

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "John",
      last_name: "Doe",
    });
    const trainer = seedTrainer(db, { person_id: tPerson, user_id: tUser });
    const post = seedPost(db, {
      trainer_id: trainer,
      user_id: tUser,
      likes_count: 0,
    });

    const likerUser = seedUser(db, {
      clerk_id: "liker1",
      name: "Liker",
      email: "l@x.com",
    });
    db.setAuthUser("liker1");

    // Dar like
    await runMutation(PostLikeMutations.toggleLike as any, ctx, {
      postId: post,
    });

    // Verificar que existe 1 solo like en la tabla
    const likes = db
      .table("post_likes")
      .filter((l: any) => l.post_id === post && l.user_id === likerUser);
    expect(likes.length).toBe(1);

    // Unlike
    await runMutation(PostLikeMutations.toggleLike as any, ctx, {
      postId: post,
    });

    // Verificar que ya no hay likes
    const likesAfter = db
      .table("post_likes")
      .filter((l: any) => l.post_id === post && l.user_id === likerUser);
    expect(likesAfter.length).toBe(0);
  });
});
