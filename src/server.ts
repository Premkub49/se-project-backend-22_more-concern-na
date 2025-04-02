import { configDotenv } from "dotenv";
import express, { Express } from "express";
import morgan from "morgan";

configDotenv({path: '.env'})

const app: Express = express();
app.use(morgan("dev"));
app.use(express.json());

const HOST = process.env.HOST || "http://localhost";
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});
