// interface.ts

// ---------- Shared Types ----------
interface RoomAvailability {
    type: string;
    remainCount: number;
}

interface SelectedRoom {
    type: string;
    count: number;
}

// ---------- GET /hotels/:id/reviews ----------
interface HotelReviewsQuery {
    selfPage: number;
    selfPageSize: number;
    otherPage: number;
    otherPageSize: number;
}

interface ReviewPagination {
    prev?: number;
    next?: number;
    count: number;
}

interface Review {
    userName: string;
    picture: string;
    stayMonth: Date;
    stayRoom: string;
    title: string;
    rating: number;
    text?: string;
    replyText?: string;
}

interface ReviewResponseSection {
    pagination: ReviewPagination;
    data: Review[];
}

interface HotelReviewsResponse {
    self: ReviewResponseSection;
    other: ReviewResponseSection;
}

// ---------- GET /hotels/:id/available ----------
interface HotelAvailabilityQuery {
    checkin: Date;
    checkout: Date;
}

interface HotelAvailabilityResponse {
    rooms: RoomAvailability[];
}

// ---------- POST /bookings ----------
interface CreateBookingBody {
    hotelId: string;
    startDate: Date;
    endDate: Date;
    selectedRooms: SelectedRoom[];
    coupons: string; // ObjectId of redeemable
}

interface CreateBookingResponse {
    redirectUrl: string; // to user’s manage booking page
}

// ---------- PUT /reviews/:id ----------
interface UpdateReviewBody {
    text: string;
    rating: number;
}



// ---------- POST /reports ----------
interface CreateReportBody {
    reviewId: string;
    reason: string;
}


// ---------- Shared ----------
interface BookingSummary {
    active: number;
    upcoming: number;
    past: number;
}

// ---------- GET /user ----------
interface GetUserResponse {
    picture?: string;
    name: string;
    email: string;
    tel: string;
    point: number;
    bookings: BookingSummary;
}

// ---------- POST /user ----------
interface CreateUserBody {
    picture?: string;
    name?: string;
    tel?: string;
    password?: string;
}

interface CreateUserResponse {
    picture?: string;
    name?: string;
    tel?: string;
    token?: string;
}


// ---------- Register ----------
interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    tel: string;
}

// ---------- Login ----------
interface LoginRequest {
    email: string;
    password: string;
}

// ---------- Auth Response ----------
type UserRole = 'guest' | 'admin' | 'user' | 'hotelManager'; // Adjust as needed

interface AuthResponse {
    success: boolean;
    token: string;
    data: {
        name: string;
        picture: string;
        role: UserRole;
        point: number;
    }
}

// ---------- Bookings Request ----------
interface BookingsRequest {
    hotel: string; // ObjectId
    user: string;  // ObjectId
    startDate: Date;
    endDate: Date;
    rooms: {
        roomType: string;
        numberOfRoom: number;
    }[];
}

// interface.ts (extended with HotelsRequest)

// ---------- Hotels Request ----------
interface HotelAddress {
    buildingNumber: string;
    street: string;
    district: string;
    province: string;
    postalCode: string;
}

interface HotelRoom {
    roomType: string;
    picture: string;
    numberOfRooms: number;
    price: number;
}

interface HotelsRequest {
    name: string;
    description: string;
    picture: string; // base64 string
    address: HotelAddress;
    tel: string;
    rooms: HotelRoom[];
}

interface BookingQuery {
    activePage?: number;
    activePageSize?: number;
    upcomingPage?: number;
    upcomingPageSize?: number;
    pastPage?: number;
    pastPageSize?: number;
}

interface BookingPagination {
    prev?: number;
    next?: number;
    count: number; // count data that query after offset
}

interface Booking {
    hotelName: string;
    startDate: Date;
    endDate: Date;
    address: string;
}

interface BookingData {
    pagination: BookingPagination;
    data: Booking[];
}

interface BookingResponse {
    active: BookingData;
    upcoming: BookingData;
    past: BookingData;
}
