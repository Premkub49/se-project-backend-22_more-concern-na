// tests/controllers/reports.test.ts
import { getReports, updateReport, addReport } from '../src/controllers/reports';
import type { NextFunction, Request, Response } from 'express';

/* ===== Mock Models ===== */
jest.mock('../src/models/Report', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn()
  },
  reportReasons: ['inappropriate', 'spam', 'offensive']
}));

import Report, { reportReasons } from '../src/models/Report';

/* ===== Helper: response mock ===== */
const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

/*
US 1-10/1
As a admin
I want to see report reviews from the hotel manager
So that I can response to reported reviews (delete review)
*/
//

/*
US 1-10/2
As a admin
I want to see report reviews from the hotel manager
So that I can response to reported reviews (delete review)
*/
describe('US 1-10 admin update report ignore status', () => {
  beforeEach(() => jest.clearAllMocks());

  const baseReq = {
    user: { role: 'admin' },
    params: { id: 'report1' },
    body: { isIgnore: true },
  } as unknown as Request;

  it('✅ allows admin to update report ignore status', async () => {
    // Arrange
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Mock findById
    (Report.findById as jest.Mock).mockResolvedValue({
      _id: 'report1',
      reportReason: 'inappropriate',
      isIgnore: false,
    });

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(Report.findById).toHaveBeenCalledWith('report1');
    expect(Report.updateOne).toHaveBeenCalledWith(
      { _id: 'report1' },
      { $set: { isIgnore: true } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ blocks update when user is not admin', async () => {
    // Arrange
    const req = {
      ...baseReq,
      user: { role: 'user' },
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'you are not an admin',
      })
    );
    expect(Report.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks update when trying to update fields other than isIgnore', async () => {
    // Arrange
    const req = {
      ...baseReq,
      body: { isIgnore: true, reportReason: 'spam' },
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: "Only 'isIgnore' field can be updated",
      })
    );
    expect(Report.updateOne).not.toHaveBeenCalled();
  });

  it('❌ blocks update when isIgnore is null', async () => {
    // Arrange
    const req = {
      ...baseReq,
      body: { isIgnore: null },
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'isIgnore can not be null',
      })
    );
  });

  it('❌ blocks update when report not found', async () => {
    // Arrange
    const req = {
      ...baseReq,
      params: { id: 'nonexistent' },
    } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Mock findById to return null
    (Report.findById as jest.Mock).mockResolvedValue(null);

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Report not found',
      })
    );
  });

  it('❌ handles server errors', async () => {
    // Arrange
    const req = { ...baseReq } as jest.Mocked<Request>;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Force an error
    (Report.findById as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    // Act
    await updateReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });
});

/*
US 1-9
As a hotel manager
I want to report reviews written about my hotel to admin
So that my hotel don't have bad reviews (spam, scam, etc.).
*/
describe('US 2-3 user add report for review', () => {
  beforeEach(() => jest.clearAllMocks());

  it('✅ creates a new report', async () => {
    // Arrange
    const reportData = {
      reportReason: 'inappropriate',
      review: 'review1',
    };

    const req = {
      body: reportData,
    } as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Mock create
    (Report.create as jest.Mock).mockResolvedValue({
      _id: 'newReport',
      ...reportData,
    });

    // Act
    await addReport(req, res, next);

    // Assert
    expect(Report.create).toHaveBeenCalledWith(reportData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('❌ handles validation errors', async () => {
    // Arrange
    const req = {
      body: { invalidField: 'value' }, // Missing required fields
    } as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Mock create to throw a validation error
    (Report.create as jest.Mock).mockRejectedValue({
      message: 'Validation failed',
    });

    // Act
    await addReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        msg: 'Validation failed',
      })
    );
  });

  it('❌ handles server errors', async () => {
    // Arrange
    const req = {
      body: { reportReason: 'inappropriate', review: 'review1' },
    } as Request;
    const res = mockRes();
    const next = jest.fn() as jest.MockedFunction<NextFunction>;

    // Force a server error without a message
    (Report.create as jest.Mock).mockRejectedValue({});

    // Act
    await addReport(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });
});
