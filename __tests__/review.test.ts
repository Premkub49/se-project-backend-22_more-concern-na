// tests/controllers/reviews.addReview.test.ts
import { addReview, deleteReview, updateReview } from '../src/controllers/reviews';
import type { Request, Response, NextFunction } from 'express';

/* ===== Mock Models ===== */
jest.mock('../src/models/Booking', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));
jest.mock('../src/models/Review', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn(), updateOne: jest.fn(), findById: jest.fn(), deleteOne: jest.fn() },
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
const reviewId = '507f191e810c19729de860dd';

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
        expect(fakeHotel.ratingCount).toBe(1);
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

/* 
US 1-2
As a customer
I want to edit my review
So that I can correct mistakes or update my feedback
*/

describe('US 1-2 customer update review', () => {
  const baseReq = {
    params: { reviewId },
    user: { _id: userId, role: 'user' },
    body: { rating: 4, title: 'Good', text: 'Updated review text' },
  } as unknown as Request;

  const review = {
    _id: reviewId,
    booking: bookingId,
    rating: 5,
  };

  const booking = {
    _id: bookingId,
    user: userId,
    hotel: hotelId,
  };

  const fakeHotel = { 
    ratingSum: 10,
    save: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('✅ allows user to update their review', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(review);
    (Booking.findById as jest.Mock).mockResolvedValue(booking);
    (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();

    await updateReview(req, res);

    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { $set: { rating: 4, title: 'Good', text: 'Updated review text' } },
    );
    expect(fakeHotel.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ blocks update if user is not the owner', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(review);
    (Booking.findById as jest.Mock).mockResolvedValue({
      ...booking,
      user: 'someOtherUserId',
    });
    (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();

    await updateReview(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Not authorized to access this route',
      }),
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks update if rating is invalid', async () => {
    (Review.findById as jest.Mock).mockResolvedValue(review);
    (Booking.findById as jest.Mock).mockResolvedValue(booking);
    (Hotel.findById as jest.Mock).mockResolvedValue(fakeHotel);

    const req = {
      ...baseReq,
      body: { rating: 6, title: 'Too good', text: 'Should fail' },
    } as unknown as Request;
    const res = mockRes();

    await updateReview(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Rating must be between 1 and 5',
      }),
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });
});


/**
 * US 1-3
As a customer
I want to delete my review
So that I can remove content I no longer wish to be public if I've changed my mind or made an error.
 */
describe('US 1-3 customer delete review', () => {
    
    const baseReq = {
        params: { reviewId },
        user: { _id: userId, role: 'user' },
    } as unknown as Request;
    
    const mockReview = {
        _id: reviewId,
        booking: bookingId,
        rating: 5,
    };
    
    const mockBooking = {
        _id: bookingId,
        user: userId,
        hotel: hotelId,
    };
    
    beforeEach(() => jest.clearAllMocks());
    
    it('✅ allows user to delete their review', async () => {
        (Review.findById as jest.Mock).mockResolvedValue(mockReview);
        (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);
        (Review.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    
        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();
    
        await deleteReview(req, res);
    
        expect(Review.deleteOne).toHaveBeenCalledWith({ _id: reviewId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });
    
    it('❌ blocks delete if user is not the owner', async () => {
        (Review.findById as jest.Mock).mockResolvedValue(mockReview);
        (Booking.findById as jest.Mock).mockResolvedValue({
        ...mockBooking,
        user: 'someOtherUserId',
        });
        (Review.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });
    
        const req = { ...baseReq } as jest.Mocked<Request>;
        const res = mockRes();
    
        await deleteReview(req, res);
    
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            success: false,
            msg: 'Not authorized to access this route',
        }),
        );
        expect(Review.deleteOne).not.toHaveBeenCalled();
    });
});