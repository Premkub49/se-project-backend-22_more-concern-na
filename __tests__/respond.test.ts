// tests/controllers/respond.test.ts
import { addRespond, updateRespond, deleteRespond } from '../src/controllers/responds';
import type { NextFunction, Request, Response } from 'express';

/* ===== Mock Models ===== */
jest.mock('../src/models/Review', () => ({
  __esModule: true,
  default: { findById: jest.fn(), updateOne: jest.fn() },
}));

import Review from '../src/models/Review';
import mongoose from 'mongoose';
import responseErrorMsg from '../src/controllers/libs/responseMsg';
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

  it('❌ blocks response when req.user is null', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: null
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

  it('❌ blocks catch error', async () => {
    
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Server error'
      })
    );
  });

  it('❌ blocks response when title or text is empty', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoReply)
    }));

    const req = { 
      ...baseReq,
      body: { title: '', text: '' } // Empty title
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await addRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Rating, title, and text are required'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

});

/*
US 1-7
As a hotel manager
I want to edit my respond to reviews written about my hotel
So that I can correct my word in responses
*/
describe('US 1-7 hotel manager update response to review', () => {
  const baseReq = {
    params: { reviewId },
    user: { _id: userId, role: 'hotelManager', hotel: hotelId },
    body: { title: 'Updated Response', text: 'Thank you for your valuable feedback' },
  } as unknown as Request;

  // Mock data
  const mockReviewWithReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: {
      _id: 'replyId123',
      title: 'Existing response',
      text: 'Some text'
    }
  };

  const mockReviewNoReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: null
  };

  const mockReviewDifferentHotel = {
    _id: reviewId,
    booking: {
      hotel: '507f191e810c19729de860bc' // Different hotel ID
    },
    reply: {
      _id: 'replyId123',
      title: 'Existing response',
      text: 'Some text'
    }
  };

  beforeEach(() => jest.clearAllMocks());

  it('✅ allows hotel manager to update their response', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { 
        $set: { 
          reply: { 
            title: 'Updated Response', 
            text: 'Thank you for your valuable feedback',
            _id: 'replyId123'
          } 
        } 
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('✅ allows admin to update any response', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));
    
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'admin' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    
    // Act
    await updateRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { 
        $set: { 
          reply: { 
            title: 'Updated Response', 
            text: 'Thank you for your valuable feedback',
            _id: 'replyId123'
          } 
        } 
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ blocks update when review has no reply', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Respond not found'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks update when user is not authorized', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'user' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

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

  it('❌ blocks hotel manager from updating response for another hotel', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewDifferentHotel)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

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

  it('❌ blocks update when review not found', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(null)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

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

  it('❌ blocks update when booking not found', async () => {
    // Arrange
    const mockReviewNoBooking = {
      _id: reviewId,
      booking: null,
      reply: {
        _id: 'replyId123',
        title: 'Existing response',
        text: 'Some text'
      }
    };
    
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoBooking)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

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

  it('❌ blocks response when req.user is null', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: null
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

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

  it('❌ blocks catch error', async () => {
    
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Server error'
      })
    );
  });

  it('❌ blocks update when title or text is empty', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));

    const req = { 
      ...baseReq,
      body: { title: '', text: '' } // Empty title
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Rating, title, and text are required'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });
});

/*
US 1-8
As a hotel manager
I want to delete my responses to reviews written about my hotel
So that I can remove my replies that not apply with current situation
*/
describe('US 1-8 hotel manager delete response to review', () => {
  const baseReq = {
    params: { reviewId },
    user: { _id: userId, role: 'hotelManager', hotel: hotelId },
  } as unknown as Request;

  // Mock data
  const mockReviewWithReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: {
      _id: 'replyId123',
      title: 'Existing response',
      text: 'Some text'
    }
  };

  const mockReviewNoReply = {
    _id: reviewId,
    booking: {
      hotel: hotelId
    },
    reply: null
  };

  const mockReviewDifferentHotel = {
    _id: reviewId,
    booking: {
      hotel: '507f191e810c19729de860bc' // Different hotel ID
    },
    reply: {
      _id: 'replyId123',
      title: 'Existing response',
      text: 'Some text'
    }
  };

  beforeEach(() => jest.clearAllMocks());

  it('✅ allows hotel manager to delete their response', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { $set: { reply: null } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('✅ allows admin to delete any response', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewWithReply)
    }));
    
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'admin' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;
    
    // Act
    await deleteRespond(req, res, next);

    // Assert
    expect(Review.updateOne).toHaveBeenCalledWith(
      { _id: reviewId },
      { $set: { reply: null } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ blocks delete when review has no reply', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoReply)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Respond not found'
      })
    );
    expect(Review.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks delete when user is not authorized', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: { _id: userId, role: 'user' }
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

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

  it('❌ blocks hotel manager from deleting response for another hotel', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewDifferentHotel)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

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

  it('❌ blocks delete when review not found', async () => {
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(null)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

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

  it('❌ blocks delete when booking not found', async () => {
    // Arrange
    const mockReviewNoBooking = {
      _id: reviewId,
      booking: null,
      reply: {
        _id: 'replyId123',
        title: 'Existing response',
        text: 'Some text'
      }
    };
    
    (Review.findById as jest.Mock).mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockReviewNoBooking)
    }));
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

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

  it('❌ blocks response when req.user is null', async () => {
    // Arrange
    const req = { 
      ...baseReq,
      user: null
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

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

it('❌ blocks catch error', async () => {
    
    // Arrange
    (Review.findById as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await deleteRespond(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Server error'
      })
    );
  });
});