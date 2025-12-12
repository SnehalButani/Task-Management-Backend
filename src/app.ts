import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from "cors";
import userRoutes from './routes/auth.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import taskRoutes from './routes/task.routes.js';


const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api/task', taskRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
    });
});

app.get("/", (req: Request, res: Response) => {
    res.send("Task Management Backend is running...");
});

const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});