/* convex/__tests__/test-utils/fakeCtx.ts */
type Doc = Record<string, any> & { _id?: string; _creationTime?: number };

class FakeQueryBuilder {
    private data: Doc[];
    private predicates: ((d: Doc) => boolean)[] = [];

    constructor(data: Doc[]) {
        this.data = data;
    }

    withIndex(_name: string, fn: (q: any) => any) {
        const conds: Array<[string, any]> = [];
        const q = {
            eq: (field: string, value: any) => {
                conds.push([field, value]);
                return q;
            },
        };
        fn(q);
        this.predicates.push((doc) => conds.every(([f, v]) => doc[f] === v));
        return this;
    }

    filter(fn: (q: any) => boolean) {
        this.predicates.push((doc) => {
            const q = {
                field: (name: string) => doc[name],
                eq: (a: any, b: any) => a === b,
                lt: (a: any, b: any) => a < b,
            };
            return fn(q);
        });
        return this;
    }

    first() {
        const list = this.collect();
        return list.length ? list[0] : null;
    }

    unique() {
        return this.first();
    }

    order(_direction: "asc" | "desc") {
        return this;
    }

    take(limit: number) {
        const list = this.collect();
        return list.slice(0, limit);
    }

    collect() {
        return this.data.filter((d) => this.predicates.every((p) => p(d)));
    }
}

export class FakeDB {
    private store: Record<string, Doc[]> = {};
    private idSeq = 1;
    private currentUser: { subject: string } | null = null;

    insert(name: string, doc: Doc) {
        const arr = (this.store[name] ||= []);
        const _id = `${name}_${this.idSeq++}`;
        const row = { _id, _creationTime: Date.now(), ...doc };
        arr.push(row);
        return _id;
    }

    get(id: string | undefined | null) {
        if (!id) return null;
        for (const name of Object.keys(this.store)) {
            const hit = (this.store[name] || []).find((d) => d._id === id);
            if (hit) return hit;
        }
        return null;
    }

    patch(id: string, patch: Partial<Doc>) {
        for (const name of Object.keys(this.store)) {
            const arr = this.store[name] || [];
            const idx = arr.findIndex((d) => d._id === id);
            if (idx >= 0) {
                this.store[name][idx] = { ...arr[idx], ...patch };
                return;
            }
        }
    }

    delete(id: string) {
        for (const name of Object.keys(this.store)) {
            const arr = this.store[name] || [];
            const idx = arr.findIndex((d) => d._id === id);
            if (idx >= 0) {
                arr.splice(idx, 1);
                return;
            }
        }
    }

    query(name: string) {
        const arr = (this.store[name] ||= []);
        return new FakeQueryBuilder(arr);
    }

    // Helpers para tests
    seed(name: string, doc: Doc) {
        return this.insert(name, doc);
    }

    table(name: string) {
        return this.store[name] || [];
    }

    // Mock de autenticación
    setAuthUser(clerkId: string | null) {
        this.currentUser = clerkId ? { subject: clerkId } : null;
    }
}

export function makeCtx(db: FakeDB) {
    return {
        db,
        auth: {
            getUserIdentity: async () => {
                return (db as any).currentUser || null;
            },
        },
        storage: {
            getUrl: async (id: string) => {
                return `https://fake-storage.com/${id}`;
            },
            generateUploadUrl: async () => {
                return "https://fake-storage.com/upload";
            },
        },
    } as unknown as any;
}