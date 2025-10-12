import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FakeDB, makeCtx } from "./test_utils/fakeCtx";
import {
    seedUser, seedRole, seedPerson, seedCity, seedAddress,
    seedBranch, seedAdmin, seedClient, seedClientBranch
} from "./test_utils/builders";
import * as InviteMutations from "../invitations/mutations";
import * as InviteQueries from "../invitations/queries";
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

describe("Invitations: pago activo, ownership y listados", () => {
    let db: FakeDB;
    beforeEach(() => { db = new FakeDB(); });

    it("Crea invitación si el cliente está al día; falla si no", async () => {
        const ctx = makeCtx(db);
        const su = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: su, role: "SUPER_ADMIN" });

        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });

        seedRole(db, { user_id: cu, role: "CLIENT" });

        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });

        const clientPaid = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: true });
        await setUser(db.get(cu));
        const ok = await runMutation(InviteMutations.inviteFriend as any, ctx, {
            payload: { inviter_client_id: clientPaid, invitee_name: "Amigo", invitee_email: "amigo@example.com" }
        });
        expect(ok.invitationId).toBeTruthy();
        expect(ok.token).toBeTruthy();
        expect(ok.expires_at).toBeGreaterThan(Date.now());

        const clientNoPay = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: false });
        await expect(
            runMutation(InviteMutations.inviteFriend as any, ctx, {
                payload: { inviter_client_id: clientNoPay, invitee_name: "Otro", invitee_email: "otro@example.com" }
            })
        ).rejects.toThrow();
    });

    it("Cancelar: solo dueño y estando PENDING", async () => {
        const ctx = makeCtx(db);
        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });

        seedRole(db, { user_id: cu, role: "CLIENT" });

        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: true });

        await setUser(db.get(cu));
        const { invitationId } = await runMutation(InviteMutations.inviteFriend as any, ctx, {
            payload: { inviter_client_id: client, invitee_name: "A", invitee_email: "a@x.com" }
        });

        const res = await runMutation(InviteMutations.cancelInvitation as any, ctx, { payload: { invitation_id: invitationId } });
        expect(res).toBe(invitationId);

        await expect(
            runMutation(InviteMutations.cancelInvitation as any, ctx, { payload: { invitation_id: invitationId } })
        ).rejects.toThrow();
    });

    it("listInvitationsByBranch incluye por preferred_branch_id o por pertenencia del cliente", async () => {
        const ctx = makeCtx(db);

        const sa = seedUser(db, { clerk_id: "su", name: "SA", email: "sa@x.com" });
        seedRole(db, { user_id: sa, role: "SUPER_ADMIN" });

        const adminUser = seedUser(db, { clerk_id: "ad", name: "AD", email: "ad@x.com" });
        seedRole(db, { user_id: adminUser, role: "ADMIN" });
        const adminPerson = seedPerson(db, { user_id: adminUser, name: "AD", last_name: "Z" });

        const city = seedCity(db);
        const addr = seedAddress(db, city);
        const branch = seedBranch(db, addr, sa);
        seedAdmin(db, { person_id: adminPerson, user_id: adminUser, branch_id: branch });

        const cu = seedUser(db, { clerk_id: "cu", name: "C", email: "c@x.com" });
        const cp = seedPerson(db, { user_id: cu, name: "C", last_name: "Y" });
        const client = seedClient(db, { person_id: cp, user_id: cu, is_payment_active: true });
        seedClientBranch(db, client, branch);

        const invA = db.seed("invitations", {
            inviter_client_id: client,
            preferred_branch_id: branch,
            status: "PENDING", active: true, token: "tA",
            created_at: Date.now(), updated_at: Date.now()
        });

        const invB = db.seed("invitations", {
            inviter_client_id: client,
            status: "PENDING", active: true, token: "tB",
            created_at: Date.now(), updated_at: Date.now()
        });

        await setUser(db.get(adminUser));
        const list = await runQuery(InviteQueries.listInvitationsByBranch as any, ctx, { payload: { branch_id: branch } });
        const ids = list.map((x: any) => x._id);
        expect(ids).toContain(invA);
        expect(ids).toContain(invB);
    });
});
