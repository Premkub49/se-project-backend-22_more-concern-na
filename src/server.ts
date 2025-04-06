import { configDotenv } from 'dotenv';
import express, { Express } from 'express';
import morgan from 'morgan';
import hotels from 'routes/hotels';
import auth from 'routes/auth';
import connectDB from './config/db';

configDotenv({ path: '.env' });

const app: Express = express();
connectDB();
app.use(morgan('dev'));
app.use(express.json());

app.use('/hotels', hotels);
app.use('/auth',auth);
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});
