async function loadCreateApp() {
    try {
        const mod = await import("../dist/index.js");
        return mod.createApp;
    } catch (_error) {
        const mod = await import("../server/index.ts");
        return mod.createApp;
    }
}

export default async function handler(req: any, res: any) {
    try {
        console.log('[API Request]', req.method, req.url);
        const createApp = await loadCreateApp();
        const { app } = await createApp();
        return app(req, res);
    } catch (error: any) {
        console.error('[API Handler Error]', error);
        console.error('[Error Details]', {
            message: error.message,
            stack: error.stack,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                SUPABASE_URL: process.env.SUPABASE_URL ? 'configured' : 'missing',
                STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
            }
        });
        res.status(500).json({ 
            error: 'Server initialization failed', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
