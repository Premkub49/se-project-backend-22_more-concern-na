import express from 'express';
import request from 'supertest';
import connectDB from '../src/config/db';
import Booking from '../src/models/Booking';
import { afterAll, afterEach, beforeAll, beforeEach, describe } from '@jest/globals';


beforeAll(async () => {
   await connectDB();
});

describe('Bookings API', () => {
   let app: any;

   beforeEach(() => {
      app = express();
      app.use(express.json());

      
   })
});