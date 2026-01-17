import { createApp } from "../server/index.js";

export default async function handler(req: any, res: any) {
    try {
        const { app } = await createApp();
        return app(req, res);
    } catch (error: any) {
        console.error('[API Handler Error]', error);
        res.status(500).json({ 
            error: 'Server initialization failed', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
