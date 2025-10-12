import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FakeDB, makeCtx } from "./test-utils/fakeCtx";
import {
    seedUser, seedRole, seedPerson, seedCity,
    seedAddress, seedBranch, seedAdmin, seedClient
} from "./test-utils/builders";
import * as LinkMutations from "../client_branches/mutations";
import { runMutation } from "./test-utils/run";

// Mock Convex runtime
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

describe("Client ↔ Branch (puente)", () => {
    let db: FakeDB;
    beforeEach(() => { db = new FakeDB(); });

    it("Crea vínculo, evita duplicado y permite re-vincular tras unlink", async () => {
        const ctx = makeCtx(db);

        const su = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: su, role: "SUPER_ADMIN" });

        const adminUser = seedUser(db, { clerk_id: "ad", name: "AD", email: "ad@x.com" });
        seedRole(db, { user_id: adminUser, role: "ADMIN" });
        const adminPerson = seedPerson(db, { user_id: adminUser, name: "AD", last_name: "X" });

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, su);
        seedAdmin(db, { person_id: adminPerson, user_id: adminUser, branch_id: branch });

        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: true });

        await setUser(db.get(adminUser));

        const linkId = await runMutation(LinkMutations.linkClientToBranch as any, ctx, { payload: { client_id: client, branch_id: branch } });
        expect(typeof linkId).toBe("string");

        await expect(
            runMutation(LinkMutations.linkClientToBranch as any, ctx, { payload: { client_id: client, branch_id: branch } })
        ).rejects.toThrow();

        await runMutation(LinkMutations.unlinkClientFromBranch as any, ctx, { payload: { client_id: client, branch_id: branch } });
        const relink = await runMutation(LinkMutations.linkClientToBranch as any, ctx, { payload: { client_id: client, branch_id: branch } });
        expect(typeof relink).toBe("string");
    });
});
