import { FakeDB } from "./fakeCtx";

export function seedUser(db: FakeDB, { clerk_id, name, email, active = true }:
    { clerk_id: string; name: string; email: string; active?: boolean; }) {
    return db.seed("users", { clerk_id, name, email, active, updated_at: Date.now() });
}

export function seedRole(db: FakeDB, { user_id, role, active = true }:
    { user_id: string; role: "CLIENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN"; active?: boolean; }) {
    return db.seed("role_assignments", {
        user_id, role, active, assigned_at: Date.now()
    });
}

export function seedPerson(db: FakeDB, { user_id, name, last_name, doc = "X123" }:
    { user_id: string; name: string; last_name: string; doc?: string; }) {
    return db.seed("persons", {
        user_id, name, last_name, born_date: "1990-01-01",
        document_type: "CC", document_number: doc, created_at: Date.now(), updated_at: Date.now(), active: true
    });
}

export function seedCity(db: FakeDB) {
    return db.seed("cities", {
        country: "CO", state_region: "Cundinamarca", name: "Bogotá", type: "CIUDAD",
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedAddress(db: FakeDB, city_id: string) {
    return db.seed("addresses", {
        city_id, main_address: "Calle 1 # 1-01", active: true, created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedBranch(db: FakeDB, address_id: string, created_by_user_id: string, name = "Sede Test") {
    return db.seed("branches", {
        name, address_id, opening_time: "06:00", closing_time: "22:00",
        max_capacity: 100, status: "ACTIVE", created_by_user_id,
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedAdmin(db: FakeDB, { person_id, user_id, branch_id }:
    { person_id: string; user_id?: string; branch_id?: string; }) {
    return db.seed("admins", {
        person_id, user_id, branch_id, status: "ACTIVE", active: true, created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedClient(db: FakeDB, { person_id, user_id, is_payment_active = true }:
    { person_id: string; user_id?: string; is_payment_active?: boolean; }) {
    return db.seed("clients", {
        person_id, user_id, status: "ACTIVE", is_payment_active,
        join_date: Date.now(), created_at: Date.now(), updated_at: Date.now(), active: true
    });
}

export function seedClientBranch(db: FakeDB, client_id: string, branch_id: string) {
    return db.seed("client_branches", { client_id, branch_id, active: true, created_at: Date.now(), updated_at: Date.now() });
}

export function seedInvitation(db: FakeDB, { inviter_client_id, preferred_branch_id }:
    { inviter_client_id: string; preferred_branch_id?: string; }) {
    return db.seed("invitations", {
        inviter_client_id, preferred_branch_id, status: "PENDING", active: true, token: "t", created_at: Date.now(), updated_at: Date.now()
    });
}
