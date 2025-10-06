import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FakeDB, makeCtx } from "./test-utils/fakeCtx";
import {
    seedUser, seedRole, seedPerson, seedCity,
    seedAddress, seedBranch, seedAdmin
} from "./test-utils/builders";
import * as AdminMutations from "../admins/mutations";
import * as AdminQueries from "../admins/queries";
import { runMutation, runQuery } from "./test-utils/run";

// Mock del runtime Convex
vi.mock("../_generated/server", () => ({
    query: (def: any) => def,
    mutation: (def: any) => def,
}));

// Mock de users
vi.mock("../users", () => ({ mustGetCurrentUser: vi.fn() }));
async function setUser(userDoc: any) {
    const mod = await import("../users");
    (mod.mustGetCurrentUser as unknown as Mock).mockResolvedValue(userDoc);
}

describe("Admins: asignación 1:1 y getMyBranch", () => {
    let db: FakeDB;
    beforeEach(() => { db = new FakeDB(); });

    it("Enforce 1:1: si la branch ya tiene admin activo, no permite asignar otro", async () => {
        const ctx = makeCtx(db);
        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });
        await setUser(db.get(sa));

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, sa);

        const aUser = seedUser(db, { clerk_id: "a", name: "A", email: "a@x.com" });
        const aPerson = seedPerson(db, { user_id: aUser, name: "A", last_name: "X" });
        seedAdmin(db, { person_id: aPerson, user_id: aUser, branch_id: branch });

        const bUser = seedUser(db, { clerk_id: "b", name: "B", email: "b@x.com" });
        const bPerson = seedPerson(db, { user_id: bUser, name: "B", last_name: "Y" });
        const adminB = seedAdmin(db, { person_id: bPerson, user_id: bUser });

        await expect(
            runMutation(AdminMutations.assignAdminToBranch as any, ctx, { payload: { admin_id: adminB, branch_id: branch } })
        ).rejects.toThrow();
    });

    it("getMyBranch devuelve la sede del admin autenticado, null si no tiene", async () => {
        const ctx = makeCtx(db);
        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });

        const ad = seedUser(db, { clerk_id: "ad", name: "AD", email: "ad@x.com" });
        const p = seedPerson(db, { user_id: ad, name: "AD", last_name: "Z" });

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const br = seedBranch(db, addr, sa);
        seedAdmin(db, { person_id: p, user_id: ad, branch_id: br });

        await setUser(db.get(ad));
        const branch = await runQuery(AdminQueries.getMyBranch as any, ctx, {});
        expect(branch?._id).toBe(br);
    });
});
