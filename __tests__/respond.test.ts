// tests/controllers/respond.test.ts
import { addRespond } from '../src/controllers/responds';
import type { NextFunction, Request, Response } from 'express';

/* ===== Mock Models ===== */
jest.mock('../src/models/Review', () => ({
  __esModule: true,
  default: { findById: jest.fn(), updateOne: jest.fn() },
}));

import Review from '../src/models/Review';
import mongoose from 'mongoose';
// Removed unused mongoose import

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
const reviewId = new mongoose.Types.ObjectId('507f191e810c19729de860dd');

/*
US 1-6
As a hotel manager
I want to respond to reviews written about my hotel
So that I can publicly address feedback and engage with guests.
*/
describe('US 1-6 hotel manager add response to review', () => {
  const baseReq = {
    params: { reviewId },
    user: { _id: userId, role: 'hotelManager', hotel: hotelId },
    body: { title: 'Thank you', text: 'We appreciate your feedback' },
  } as unknown as Request;

  // Mock data
  const mockReviewNoReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: null
  };

  const mockReviewWithReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: {
      title: 'Existing response',
      text: 'Some text'
    }
  };

  const mockReviewDifferentHotel = {
    _id: reviewId,
    booking: {
      hotel: '507f191e810c19729de860bc' // Different hotel ID
    },
    reply: null
  };

  beforeEach(() => jest.clearAllMocks());

  it('✅ allows hotel manager to respond to a review for their hotel', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { $set: { reply: { title: 'Thank you', text: 'We appreciate your feedback' } } }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('✅ allows admin to respond to a review for any hotel', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoReply)
    }));
    
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'admin' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    
    // Act
    await addRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { $set: { reply: { title: 'Thank you', text: 'We appreciate your feedback' } } }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ blocks response when review already has a reply', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Respond already exists'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks response when user is not authorized', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'user' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Not authorized to access this route'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks hotel manager from responding to review of another hotel', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewDifferentHotel)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Not authorized to access this route'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks response when review not found', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(null)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Review not found'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks response when booking not found', async () => {
    // Arrange
    const mockReviewNoBooking = {
      _id: reviewId,
      booking: null,
      reply: null
    };
    
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoBooking)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Booking not found'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });
});


