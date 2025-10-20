/* convex/__tests__/test-utils/run.ts */
// Helper para ejecutar funciones registradas de Convex en tests

export async function runQuery(q: any, ctx: any, args: any) {
    return await q.handler(ctx, args);
}

export async function runMutation(m: any, ctx: any, args: any) {
    return await m.handler(ctx, args);
}

