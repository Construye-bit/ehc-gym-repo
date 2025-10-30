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
        document_type: "CC", document_number: doc,
        created_at: Date.now(), updated_at: Date.now(), active: true
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

export function seedTrainer(db: FakeDB, { person_id, user_id, branch_id, status = "ACTIVE" }:
    { person_id: string; user_id?: string; branch_id?: string; status?: "ACTIVE" | "INACTIVE" | "ON_VACATION"; }) {
    return db.seed("trainers", {
        person_id, user_id, branch_id, employee_code: `EMP${Date.now()}`,
        specialties: ["Fitness"], hire_date: Date.now(), status,
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedAdmin(db: FakeDB, { person_id, user_id, branch_id, created_by_user_id }:
    { person_id: string; user_id?: string; branch_id?: string; created_by_user_id?: string; }) {
    return db.seed("admins", {
        person_id, user_id, branch_id, status: "ACTIVE", active: true,
        created_by_user_id: created_by_user_id || user_id || person_id,
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedClient(db: FakeDB, { person_id, user_id, is_payment_active = true, created_by_user_id }:
    { person_id: string; user_id?: string; is_payment_active?: boolean; created_by_user_id?: string; }) {
    return db.seed("clients", {
        person_id, user_id, status: "ACTIVE", is_payment_active,
        join_date: Date.now(),
        created_by_user_id: created_by_user_id || user_id || person_id,
        created_at: Date.now(), updated_at: Date.now(), active: true
    });
}

export function seedClientBranch(db: FakeDB, client_id: string, branch_id: string) {
    return db.seed("client_branches", { client_id, branch_id, active: true, created_at: Date.now(), updated_at: Date.now() });
}

export function seedInvitation(db: FakeDB, { inviter_client_id, preferred_branch_id, invitee_name = "Invitado Test", token = `token_${Date.now()}` }:
    { inviter_client_id: string; preferred_branch_id?: string; invitee_name?: string; token?: string; }) {
    return db.seed("invitations", {
        inviter_client_id, preferred_branch_id, invitee_name, token,
        status: "PENDING", active: true,
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedPost(db: FakeDB, { trainer_id, user_id, description = "Test post", image_storage_id, likes_count = 0 }:
    { trainer_id: string; user_id: string; description?: string; image_storage_id?: string; likes_count?: number; }) {
    return db.seed("posts", {
        trainer_id, user_id, description, image_storage_id,
        image_url: image_storage_id ? "https://example.com/img.jpg" : undefined,
        likes_count, published_at: Date.now(),
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedPostLike(db: FakeDB, { post_id, user_id }:
    { post_id: string; user_id: string; }) {
    return db.insert("post_likes", {
        post_id, user_id, created_at: Date.now()
    });
}
// ==================== CHAT: NUEVOS BUILDERS ====================

export function seedConversation(db: FakeDB, { client_user_id, trainer_user_id, status = "OPEN", contract_valid_until }:
    { client_user_id: string; trainer_user_id: string; status?: "OPEN" | "BLOCKED" | "CONTRACTED"; contract_valid_until?: number; }) {
    return db.seed("conversations", {
        client_user_id, trainer_user_id, status, contract_valid_until,
        last_message_at: Date.now(),
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedMessage(db: FakeDB, { conversation_id, author_user_id, text = "Test message", status = "SENT" }:
    { conversation_id: string; author_user_id: string; text?: string; status?: "SENT" | "READ"; }) {
    return db.insert("messages", {
        conversation_id, author_user_id, text, status,
        created_at: Date.now()
    });
}

export function seedMessageQuota(db: FakeDB, { conversation_id, used_count = 0 }:
    { conversation_id: string; used_count?: number; }) {
    return db.seed("message_quotas", {
        conversation_id, used_count,
        reset_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
        created_at: Date.now(), updated_at: Date.now()
    });
}
