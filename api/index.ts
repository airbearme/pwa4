import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes inside the handler to handle the async nature correctly in Vercel
let initialized = false;

app.use(async (req, res, next) => {
    if (!initialized) {
        try {
            await registerRoutes(app);
            initialized = true;

            // Error handling (attach after routes)
            app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
                const status = err.status || err.statusCode || 500;
                const message = err.message || "Internal Server Error";
                console.error("API Error:", err);
                res.status(status).json({ message });
            });

        } catch (error) {
            console.error("Initialization Error:", error);
            return res.status(500).json({ message: "Failed to initialize API" });
        }
    }
    next();
});

export default app;
