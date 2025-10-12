import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FakeDB, makeCtx } from "./test-utils/fakeCtx";
import {
    seedUser, seedRole, seedPerson, seedBranch,
    seedCity, seedAddress, seedAdmin, seedClient, seedClientBranch
} from "./test-utils/builders";
import * as ClientsQueries from "../clients/queries";
import { runQuery } from "./test-utils/run";

// Mock del runtime de Convex para que query/mutation devuelvan { handler, ... }
vi.mock("../_generated/server", () => ({
    query: (def: any) => def,
    mutation: (def: any) => def,
}));

// Mock de users (identidad)
vi.mock("../users", () => ({ mustGetCurrentUser: vi.fn() }));
async function setUser(userDoc: any) {
    const mod = await import("../users");
    (mod.mustGetCurrentUser as unknown as Mock).mockResolvedValue(userDoc);
}

describe("RBAC y Alcance por sede", () => {
    let db: FakeDB;
    beforeEach(() => { db = new FakeDB(); });

    it("ADMIN no asignado NO puede listar clientes de otra sede", async () => {
        const ctx = makeCtx(db);

        const superUser = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: superUser, role: "SUPER_ADMIN" });

        const adminUser = seedUser(db, { clerk_id: "ad", name: "Admin", email: "ad@x.com" });
        seedRole(db, { user_id: adminUser, role: "ADMIN" });
        const adminPerson = seedPerson(db, { user_id: adminUser, name: "Admin", last_name: "X" });
        seedAdmin(db, { person_id: adminPerson, user_id: adminUser }); // sin branch

        const city = seedCity(db);
        const addrA = seedAddress(db, city);
        const branchA = seedBranch(db, addrA, superUser, "Sede A");
        const addrB = seedAddress(db, city);
        const branchB = seedBranch(db, addrB, superUser, "Sede B");

        const clientUser = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const clientPerson = seedPerson(db, { user_id: clientUser, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: clientPerson, user_id: clientUser, is_payment_active: true });
        seedClientBranch(db, client, branchA);

        await setUser(db.get(adminUser));

        await expect(
            runQuery(ClientsQueries.listClientsByBranch as any, ctx, { payload: { branch_id: branchA, status: "ACTIVE" } })
        ).rejects.toThrow();
    });

    it("ADMIN asignado SÍ puede listar clientes de su sede", async () => {
        const ctx = makeCtx(db);

        const superUser = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: superUser, role: "SUPER_ADMIN" });

        const adminUser = seedUser(db, { clerk_id: "ad", name: "Admin", email: "ad@x.com" });
        seedRole(db, { user_id: adminUser, role: "ADMIN" });
        const adminPerson = seedPerson(db, { user_id: adminUser, name: "Admin", last_name: "X" });
        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, superUser, "Sede A");
        seedAdmin(db, { person_id: adminPerson, user_id: adminUser, branch_id: branch });

        const clientUser = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const clientPerson = seedPerson(db, { user_id: clientUser, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: clientPerson, user_id: clientUser, is_payment_active: true });
        seedClientBranch(db, client, branch);

        await setUser(db.get(adminUser));

        const list = await runQuery(ClientsQueries.listClientsByBranch as any, ctx, { payload: { branch_id: branch, status: "ACTIVE" } });
        expect(Array.isArray(list)).toBe(true);
        expect(list.some((c: any) => c._id === client)).toBe(true);
    });
});
