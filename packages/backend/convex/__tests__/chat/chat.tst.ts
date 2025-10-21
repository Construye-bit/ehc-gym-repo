import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeDB, makeCtx } from "../test_utils/fakeCtx";
import {
  seedUser,
  seedRole,
  seedPerson,
  seedTrainer,
  seedClient,
} from "../test_utils/builders";
import * as TrainerCatalogQueries from "../../chat/trainer_catalog/queries";
import * as ConversationMutations from "../../chat/conversations/mutations";
import * as ConversationQueries from "../../chat/conversations/queries";
import * as MessageMutations from "../../chat/messages/mutations";
import * as MessageQueries from "../../chat/messages/queries";
import { runMutation, runQuery } from "../test_utils/run";

// Mock Convex runtime
// Al inicio de cada archivo, después de los imports
vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
  action: (def: any) => def,
  internalQuery: (def: any) => def,
  internalMutation: (def: any) => def,
  internalAction: (def: any) => def,
}));
describe("Chat: Catálogo de entrenadores", () => {
  let db: FakeDB;
  beforeEach(() => {
    db = new FakeDB();
  });

  it("getPublicTrainers: devuelve solo entrenadores ACTIVE", async () => {
    const ctx = makeCtx(db);

    // Entrenador ACTIVE
    const t1User = seedUser(db, {
      clerk_id: "t1",
      name: "Trainer1",
      email: "t1@x.com",
    });
    const t1Person = seedPerson(db, {
      user_id: t1User,
      name: "John",
      last_name: "Active",
    });
    const t1 = seedTrainer(db, {
      person_id: t1Person,
      user_id: t1User,
      status: "ACTIVE",
    });

    // Entrenador INACTIVE
    const t2User = seedUser(db, {
      clerk_id: "t2",
      name: "Trainer2",
      email: "t2@x.com",
    });
    const t2Person = seedPerson(db, {
      user_id: t2User,
      name: "Jane",
      last_name: "Inactive",
    });
    seedTrainer(db, {
      person_id: t2Person,
      user_id: t2User,
      status: "INACTIVE",
    });

    const result = await runQuery(
      TrainerCatalogQueries.getPublicTrainers as any,
      ctx,
      {}
    );

    expect(result.trainers.length).toBe(1);
    expect(result.trainers[0].name).toBe("John Active");
  });

  it("getPublicTrainers: filtra por especialidad", async () => {
    const ctx = makeCtx(db);

    const t1User = seedUser(db, {
      clerk_id: "t1",
      name: "T1",
      email: "t1@x.com",
    });
    const t1Person = seedPerson(db, {
      user_id: t1User,
      name: "Yoga",
      last_name: "Master",
    });
    seedTrainer(db, {
      person_id: t1Person,
      user_id: t1User,
      status: "ACTIVE",
    });
    // Modificar specialties manualmente
    const trainer = db.table("trainers")[0];
    trainer.specialties = ["Yoga", "Pilates"];

    const result = await runQuery(
      TrainerCatalogQueries.getPublicTrainers as any,
      ctx,
      { specialty: "yoga" }
    );

    expect(result.trainers.length).toBe(1);
    expect(result.trainers[0].specialties).toContain("Yoga");
  });
});

describe("Chat: Conversaciones", () => {
  let db: FakeDB;
  beforeEach(() => {
    db = new FakeDB();
  });

  it("createOrGet: cliente puede crear conversación con entrenador", async () => {
    const ctx = makeCtx(db);

    // Cliente
    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });
    const cPerson = seedPerson(db, {
      user_id: cUser,
      name: "Carlos",
      last_name: "Cliente",
    });
    seedClient(db, { person_id: cPerson, user_id: cUser });

    // Entrenador
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "Juan",
      last_name: "Trainer",
    });
    const trainer = seedTrainer(db, {
      person_id: tPerson,
      user_id: tUser,
      status: "ACTIVE",
    });

    // Autenticar como cliente
    db.setAuthUser("client1");

    const result = await runMutation(
      ConversationMutations.createOrGet as any,
      ctx,
      { trainerId: trainer }
    );

    expect(result.success).toBe(true);
    expect(result.data.isNew).toBe(true);

    const conversations = db.table("conversations");
    expect(conversations.length).toBe(1);
    expect(conversations[0].client_user_id).toBe(cUser);
    expect(conversations[0].trainer_user_id).toBe(tUser);
    expect(conversations[0].status).toBe("OPEN");
  });

  it("createOrGet: reutiliza conversación existente", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });
    const cPerson = seedPerson(db, {
      user_id: cUser,
      name: "Carlos",
      last_name: "Cliente",
    });
    seedClient(db, { person_id: cPerson, user_id: cUser });

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "Juan",
      last_name: "Trainer",
    });
    const trainer = seedTrainer(db, {
      person_id: tPerson,
      user_id: tUser,
      status: "ACTIVE",
    });

    db.setAuthUser("client1");

    // Primera llamada: crea
    const result1 = await runMutation(
      ConversationMutations.createOrGet as any,
      ctx,
      { trainerId: trainer }
    );
    expect(result1.data.isNew).toBe(true);

    // Segunda llamada: reutiliza
    const result2 = await runMutation(
      ConversationMutations.createOrGet as any,
      ctx,
      { trainerId: trainer }
    );
    expect(result2.data.isNew).toBe(false);
    expect(result2.data.conversationId).toBe(result1.data.conversationId);

    // Solo debe haber 1 conversación
    expect(db.table("conversations").length).toBe(1);
  });

  it("markContract: solo entrenador puede marcar contrato", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "Juan",
      last_name: "Trainer",
    });
    seedTrainer(db, {
      person_id: tPerson,
      user_id: tUser,
      status: "ACTIVE",
    });

    // Crear conversación
    const convId = db.insert("conversations", {
      client_user_id: cUser,
      trainer_user_id: tUser,
      status: "OPEN",
      last_message_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Cliente intenta marcar contrato
    db.setAuthUser("client1");
    await expect(
      runMutation(ConversationMutations.markContract as any, ctx, {
        conversationId: convId,
        valid_until: Date.now() + 30 * 24 * 60 * 60 * 1000,
      })
    ).rejects.toThrow();

    // Entrenador marca contrato
    db.setAuthUser("trainer1");
    const result = await runMutation(
      ConversationMutations.markContract as any,
      ctx,
      {
        conversationId: convId,
        valid_until: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }
    );

    expect(result.success).toBe(true);

    const conversation = db.get(convId);
    expect(conversation?.status).toBe("CONTRACTED");
  });
});

describe("Chat: Mensajes", () => {
  let db: FakeDB;
  beforeEach(() => {
    db = new FakeDB();
  });

  it("send: entrenador puede enviar mensajes sin límite", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });
    seedRole(db, { user_id: tUser, role: "TRAINER" });
    const tPerson = seedPerson(db, {
      user_id: tUser,
      name: "Juan",
      last_name: "Trainer",
    });
    seedTrainer(db, {
      person_id: tPerson,
      user_id: tUser,
      status: "ACTIVE",
    });

    const convId = db.insert("conversations", {
      client_user_id: cUser,
      trainer_user_id: tUser,
      status: "OPEN",
      last_message_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    db.setAuthUser("trainer1");

    // Enviar múltiples mensajes
    for (let i = 0; i < 25; i++) {
      const result = await runMutation(MessageMutations.send as any, ctx, {
        conversationId: convId,
        text: `Mensaje ${i}`,
      });
      expect(result.success).toBe(true);
    }

    const messages = db.table("messages");
    expect(messages.length).toBe(25);
  });

  it("send: cliente tiene límite de 20 mensajes gratuitos", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });
    const cPerson = seedPerson(db, {
      user_id: cUser,
      name: "Carlos",
      last_name: "Cliente",
    });
    seedClient(db, { person_id: cPerson, user_id: cUser });

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });

    const convId = db.insert("conversations", {
      client_user_id: cUser,
      trainer_user_id: tUser,
      status: "OPEN",
      last_message_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    db.setAuthUser("client1");

    // Enviar 20 mensajes: OK
    for (let i = 0; i < 20; i++) {
      const result = await runMutation(MessageMutations.send as any, ctx, {
        conversationId: convId,
        text: `Mensaje ${i}`,
      });
      expect(result.success).toBe(true);
    }

    const messages = db.table("messages");
    expect(messages.length).toBe(20);

    // Mensaje 21: debe bloquear
    await expect(
      runMutation(MessageMutations.send as any, ctx, {
        conversationId: convId,
        text: "Mensaje 21",
      })
    ).rejects.toThrow();

    const conversation = db.get(convId);
    expect(conversation?.status).toBe("BLOCKED");
  });

  it("send: cliente con contrato activo puede enviar ilimitado", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    seedRole(db, { user_id: cUser, role: "CLIENT" });
    const cPerson = seedPerson(db, {
      user_id: cUser,
      name: "Carlos",
      last_name: "Cliente",
    });
    seedClient(db, { person_id: cPerson, user_id: cUser });

    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });

    const convId = db.insert("conversations", {
      client_user_id: cUser,
      trainer_user_id: tUser,
      status: "CONTRACTED",
      contract_valid_until: Date.now() + 30 * 24 * 60 * 60 * 1000,
      last_message_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    db.setAuthUser("client1");

    // Enviar 25 mensajes: todos OK
    for (let i = 0; i < 25; i++) {
      const result = await runMutation(MessageMutations.send as any, ctx, {
        conversationId: convId,
        text: `Mensaje ${i}`,
      });
      expect(result.success).toBe(true);
    }

    const messages = db.table("messages");
    expect(messages.length).toBe(25);

    const conversation = db.get(convId);
    expect(conversation?.status).toBe("CONTRACTED");
  });

  it("get: devuelve mensajes paginados", async () => {
    const ctx = makeCtx(db);

    const cUser = seedUser(db, {
      clerk_id: "client1",
      name: "Client",
      email: "c@x.com",
    });
    const tUser = seedUser(db, {
      clerk_id: "trainer1",
      name: "Trainer",
      email: "t@x.com",
    });

    const convId = db.insert("conversations", {
      client_user_id: cUser,
      trainer_user_id: tUser,
      status: "OPEN",
      last_message_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Crear 15 mensajes
    for (let i = 0; i < 15; i++) {
      db.insert("messages", {
        conversation_id: convId,
        author_user_id: cUser,
        text: `Mensaje ${i}`,
        status: "SENT",
        created_at: Date.now() + i * 1000,
      });
    }

    db.setAuthUser("client1");

    const result = await runQuery(MessageQueries.get as any, ctx, {
      conversationId: convId,
      limit: 10,
    });

    expect(result.messages.length).toBe(10);
    expect(result.nextCursor).not.toBeNull();
  });
});
