// tests/controllers/auth.register.test.ts
import { register } from '../src/controllers/auth';
import type { Request, Response, NextFunction } from 'express';

// ==== mock model ====
jest.mock('../src/models/User', () => {
  const mUser = { create: jest.fn() };
  return { __esModule: true, default: mUser };
});
import User from '../src/models/User';           // ดึงหลัง mock จะปลอดภัย

// ==== helper res ====
const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.cookie = jest.fn().mockReturnThis();
  res.json  = jest.fn().mockReturnThis();
  return res as Response;
};

describe('auth.register', () => {
  const fakeUser = {
    name: 'John', email: 'john@example.com', tel: '0812345678',
    picture: '', role: 'customer', point: 0, password: 'hashed',
    getSignedJwtToken: jest.fn().mockReturnValue('fake.jwt.token'),
  };

  beforeEach(() => jest.clearAllMocks());

  it('should create user and send token (200)', async () => {
    (User.create as jest.Mock).mockResolvedValue(fakeUser);
    const req = { body: { ...fakeUser, password: 'plain' } } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await register(req, res, next);

    expect(User.create).toHaveBeenCalledWith({
      name: fakeUser.name,
      tel: fakeUser.tel,
      picture: fakeUser.picture,
      email: fakeUser.email,
      password: 'plain',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith(
      'token', 'fake.jwt.token', expect.any(Object)
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: 'fake.jwt.token' })
    );
  });

  it('should return 400 on duplicate email', async () => {
    (User.create as jest.Mock).mockRejectedValue({ code: 11000 });
    const req = { body: { email: 'dup@mail.com' } } as Request;
    const res = mockRes();
    await register(req, res, {} as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });
});
