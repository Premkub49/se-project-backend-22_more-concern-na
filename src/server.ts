import { configDotenv } from 'dotenv';
import express, { Express } from 'express';
import morgan from 'morgan';
import auth from './routes/auth';
import bookings from './routes/bookings';
import hotels from './routes/hotels';
import connectDB from './config/db';

configDotenv({ path: '.env' });

const app: Express = express();
connectDB();
app.use(morgan('dev'));
app.use(express.json());

app.use('/hotels', hotels);
app.use('/auth', auth);
app.use('/bookings', bookings);

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
