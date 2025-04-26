// tests/controllers/reviews.addReview.test.ts
import { addReview } from '../src/controllers/reviews';
import type { Request, Response, NextFunction } from 'express';

/* ===== Mock Models ===== */
jest.mock('../src/models/Booking', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('../src/models/Review', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() },
}));
jest.mock('../src/models/Hotel', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

import Booking from '../src/models/Booking';
import Review from '../src/models/Review';
import Hotel from '../src/models/Hotel';

/* ===== Helper: response mock ===== */
const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

/* ===== Valid ObjectId strings (24-char hex) ===== */
const userId = '507f191e810c19729de860aa';
const hotelId = '507f191e810c19729de860bb';
const bookingId = '507f191e810c19729de860cc';

/*
US 1-1
As a customer
I want to review of my stay
So that I can make feedback and help others make informed decisions.
*/
describe('US 1-1 customer add review', () => {
    const baseReq = {
        params: { bookingId },
        user: { _id: userId, role: 'user' },
        body: { rating: 5, title: 'Great', text: 'Nice stay' },
    } as unknown as Request;

    const bookingCompleted = {
        _id: bookingId,
        user: userId,
        status: 'completed',
        hotel: hotelId,
    };
    const bookingNotDone = { ...bookingCompleted, status: 'reserved' };
    const bookingNotOwned = { ...bookingCompleted, user: '507f191e810c19729de860dd' }; 

    const fakeHotel = { ratingSum: 0, ratingCount: 0, save: jest.fn() };

    beforeEach(() => jest.clearAllMocks());

    it('✅ allows writing a review when booking is completed', async () => {
        // Arrange
        (Booking.findById as jest.Mock).mockResolvedValue(bookingCompleted);
        (Review.findOne as jest.Mock).mockResolvedValue(null); 
        (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();

        // Act
        await addReview(req, res);

        // Assert
        expect(Review.create).toHaveBeenCalledWith(
            expect.objectContaining({
                rating: 5,
                title: 'Great',
                text: 'Nice stay',
                booking: expect.any(Object), 
            }),
        );
        expect(fakeHotel.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('❌ blocks review when booking is NOT completed', async () => {
        (Booking.findById as jest.Mock).mockResolvedValue(bookingNotDone);
        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();

        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                msg: 'Booking is not completed',
            }),
        );
        expect(Review.create).not.toHaveBeenCalled();
    });

    it('❌ blocks review when booking does not belong to the user', async () => {
        (Booking.findById as jest.Mock).mockResolvedValue(bookingNotOwned);
        (Review.findOne as jest.Mock).mockResolvedValue(null); 
        (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();

        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                msg: 'Not authorized to access this route',
            }),
        );
        expect(Review.create).not.toHaveBeenCalled();
    });

    it('❌ blocks review when already exists in this booking', async () => {
        (Booking.findById as jest.Mock).mockResolvedValue(bookingCompleted);
        (Review.findOne as jest.Mock).mockResolvedValue({}); 
        (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();

        await addReview(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                msg: 'Review associated with this booking is already exist',
            }),
        );
        expect(Review.create).not.toHaveBeenCalled();
    }
    );
});
