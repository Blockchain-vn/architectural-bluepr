import app from "./app";

const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${APP_URL}`);
    console.log(`📚 API Documentation available at ${APP_URL}/api-docs`);
});
