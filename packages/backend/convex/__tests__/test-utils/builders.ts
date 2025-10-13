/* convex/__tests__/test-utils/builders.ts */
import { FakeDB } from "./fakeCtx";

export function seedUser(db: FakeDB, { clerk_id, name, email, active = true }:
    { clerk_id: string; name: string; email: string; active?: boolean; }) {
    return db.insert("users", { clerk_id, name, email, active, updated_at: Date.now() });
}

export function seedRole(db: FakeDB, { user_id, role, active = true }:
    { user_id: string; role: "CLIENT" | "TRAINER" | "ADMIN" | "SUPER_ADMIN"; active?: boolean; }) {
    return db.insert("role_assignments", {
        user_id, role, active, assigned_at: Date.now()
    });
}

export function seedPerson(db: FakeDB, { user_id, name, last_name, doc = "X123" }:
    { user_id: string; name: string; last_name: string; doc?: string; }) {
    return db.insert("persons", {
        user_id, name, last_name, born_date: "1990-01-01",
        document_type: "CC", document_number: doc,
        created_at: Date.now(), updated_at: Date.now(), active: true
    });
}

export function seedTrainer(db: FakeDB, { person_id, user_id, branch_id, status = "ACTIVE" }:
    { person_id: string; user_id?: string; branch_id?: string; status?: "ACTIVE" | "INACTIVE" | "ON_VACATION"; }) {
    return db.insert("trainers", {
        person_id, user_id, branch_id, employee_code: `EMP${Date.now()}`,
        specialties: ["Fitness"], hire_date: Date.now(), status,
        created_at: Date.now(), updated_at: Date.now()
    });
}

export function seedPost(db: FakeDB, { trainer_id, user_id, description = "Test post", image_storage_id, likes_count = 0 }:
    { trainer_id: string; user_id: string; description?: string; image_storage_id?: string; likes_count?: number; }) {
    return db.insert("posts", {
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