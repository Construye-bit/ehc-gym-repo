/* In-memory ctx/db para pruebas de Convex */
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
        // Evaluamos por-doc con un "q" que expone field/eq al estilo Convex.
        this.predicates.push((doc) => {
            const q = {
                field: (name: string) => doc[name],
                eq: (a: any, b: any) => a === b,
            };
            return fn(q);
        });
        return this;
    }

    first() {
        const list = this.collect();
        return list.length ? list[0] : null;
    }

    collect() {
        return this.data.filter((d) => this.predicates.every((p) => p(d)));
    }
}

export class FakeDB {
    private store: Record<string, Doc[]> = {};
    private idSeq = 1;

    constructor() { }

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
}

export function makeCtx(db: FakeDB) {
    // ctx mínimo que usan tus funciones (db + whatever)
    return {
        db,
    } as unknown as any;
}

