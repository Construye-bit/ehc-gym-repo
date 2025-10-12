import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FakeDB, makeCtx } from "./test_utils/fakeCtx";
import {
    seedUser, seedRole, seedPerson, seedCity, seedAddress,
    seedBranch, seedAdmin, seedClient, seedClientBranch
} from "./test_utils/builders";
import * as ClientMutations from "../clients/mutations";
import * as ClientQueries from "../clients/queries";
import { runMutation, runQuery } from "./test_utils/run";

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

describe("Clients: creación, pago, listados", () => {
    let db: FakeDB;
    beforeEach(() => { db = new FakeDB(); });

    it("No permite dos clientes activos para la misma persona", async () => {
        const ctx = makeCtx(db);
        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });
        await setUser(db.get(sa));

        const p = seedPerson(db, { user_id: sa, name: "X", last_name: "Y" });
        const c1 = await runMutation(
            ClientMutations.createClient as any,
            ctx,
            { payload: { person_id: p, status: "ACTIVE", is_payment_active: true, join_date: Date.now() } }
        );
        expect(typeof c1).toBe("string");

        await expect(
            runMutation(
                ClientMutations.createClient as any,
                ctx,
                { payload: { person_id: p, status: "ACTIVE", is_payment_active: true, join_date: Date.now() } }
            )
        ).rejects.toThrow();
    });

    it("setClientPaymentActive: solo ADMIN de la branch del cliente (o SA)", async () => {
        const ctx = makeCtx(db);
        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });

        const aUser = seedUser(db, { clerk_id: "ad", name: "AD", email: "ad@x.com" });
        seedRole(db, { user_id: aUser, role: "ADMIN" });
        const aPerson = seedPerson(db, { user_id: aUser, name: "AD", last_name: "Z" });

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, sa);
        seedAdmin(db, { person_id: aPerson, user_id: aUser, branch_id: branch });

        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: false });
        seedClientBranch(db, client, branch);

        await setUser(db.get(aUser));
        await runMutation(ClientMutations.setClientPaymentActive as any, ctx, { payload: { client_id: client, is_payment_active: true } });
        const updated = db.get(client)!;
        expect(updated.is_payment_active).toBe(true);

        const otherAdminUser = seedUser(db, { clerk_id: "ad2", name: "AD2", email: "ad2@x.com" });
        seedRole(db, { user_id: otherAdminUser, role: "ADMIN" });
        const otherPerson = seedPerson(db, { user_id: otherAdminUser, name: "A2", last_name: "W" });
        // sin branch asignada
        await setUser(db.get(otherAdminUser));

        await expect(
            runMutation(ClientMutations.setClientPaymentActive as any, ctx, { payload: { client_id: client, is_payment_active: false } })
        ).rejects.toThrow();
    });

    it("listClientsByBranch devuelve solo los vinculados a esa branch", async () => {
        const ctx = makeCtx(db);
        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });

        const aUser = seedUser(db, { clerk_id: "ad", name: "AD", email: "ad@x.com" });
        seedRole(db, { user_id: aUser, role: "ADMIN" });
        const aPerson = seedPerson(db, { user_id: aUser, name: "AD", last_name: "Z" });

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, sa);
        seedAdmin(db, { person_id: aPerson, user_id: aUser, branch_id: branch });

        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });
        const c1 = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: true });
        seedClientBranch(db, c1, branch);

        const cp2 = seedPerson(db, { user_id: cu, name: "D", last_name: "Z" });
        const c2 = seedClient(db, { person_id: cp2, user_id: cu, is_payment_active: true });

        await setUser(db.get(aUser));
        const list = await runQuery(ClientQueries.listClientsByBranch as any, ctx, { payload: { branch_id: branch, status: "ACTIVE" } });
        expect(list.some((c: any) => c._id === c1)).toBe(true);
        expect(list.some((c: any) => c._id === c2)).toBe(false);
    });
});
