import { configDotenv } from 'dotenv';
import express, { Express } from 'express';
import morgan from 'morgan';
import auth from './routes/auth';
import user from './routes/user';
import bookings from './routes/bookings';
import hotels from './routes/hotels';
import connectDB from './config/db';
import reports from './routes/reports'
import reviews from './routes/reviews';
import cors from 'cors';

configDotenv({ path: '.env' });

const app: Express = express();
connectDB();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/hotels', hotels);
app.use('/auth', auth);
app.use('/user',user);
app.use('/bookings', bookings);
app.use('/reports', reports);
app.use('/reviews', reviews);

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 5050;
if (process.env.NODE_ENV === "production") {
  module.exports = app;
}
else if (process.env.NODE_ENV === "development"){
  app.listen(PORT, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
  });
}
