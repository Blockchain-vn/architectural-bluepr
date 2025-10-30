import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import contentRoutes from "./models/content/content.routes";
import userRoutes from "./models/user/user.routes";
import searchRoutes from "./models/search/search.routes";
import commentRoutes from "./models/comment/comment.routes";
import paymentRoutes from "./models/payment/payment.routes";
import copyrightRoutes from "./models/copyright/copyright.routes";
import resourceRoutes from "./models/resource/resource.routes";
import socialRoutes from "./models/social/social.routes";
import adminRoutes from "./models/admin/admin.routes";
import { setupSwagger } from "./config/swagger";

dotenv.config();
const app = express();
setupSwagger(app);

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());

// Kết nối database
connectDB();

// Routes
app.use("/api/content", contentRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', copyrightRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);

export default app;