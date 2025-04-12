// ---------- Shared Types ----------
type UserRole = 'admin' | 'user' | 'hotelManager';
interface GenericResponse {
    success: boolean;
    msg ?: string
}

interface Pagination {
    pagination: {
        next?: {
            page: number;
            limit: number;
        },
        prev?: {
            page: number;
            limit: number;
        }
    }
}

//-----HotelSchema Interface-----
interface RoomAvailability {
    type: string;
    remainCount: number;
}
interface Rooms {
    _id?: string;
    roomType: string;
    picture?: string;
    capacity: number;
    maxCount: number;
    price: number;
}
interface IHotel {
    _id?: string;
    name: string;
    description?: string;
    picture?: string;
    buildingNumber: string;
    street: string;
    district: string;
    province: string;
    postalCode: string;
    tel: string;
    rooms: Rooms[];
    ratingSum: number;
    ratingCount: number;
}

interface HotelResponse extends GenericResponse, Pagination {
    count: number;
    data: IHotel[]
}
interface HotelAvailabilityResponse extends GenericResponse {
    rooms: RoomAvailability[];
}

//------UserSchema Interface-----
interface UserRedeemable {
    redeemableId: string;
    count: number;
}
interface IUser {
    _id: string;
    id?: string;
    name: string;
    tel: string;
    picture?: string;
    email: string;
    password: string;
    role: string;
    hotel: string;
    point: number;
    inventory: UserRedeemable[];
    createdAt: Date;
}

interface LoginRequest {
    email: string;
    password: string;
}
interface GetMeResponse extends GenericResponse {
    data: IUser;
}
interface AuthResponse extends GenericResponse{
    token: string;
    data: {
        name: string;
        picture: string;
        role: UserRole;
        point: number;
    }
}

//-------ReviewSchema Interface------
interface IReview {
    _id: string;
    booking?: string;
    rating?: number;
    reply?: string;
    title?: string;
    text?: string;
    createdAt: Date;
  }

//-------ReportSchema Interface------
interface IReport {
    _id: string;
    review: string;
    reportDate: Date;
    reportReason: string;
    isIgnore: boolean;
  }

//-------RedeemableSchema Interface------
interface IRedeemable {
    _id: string;
    type: string;
    name: string;
    description?: string;
    picture?: string;
    pointUse: number;
    discount?: number;
    remainCount: number;
}

//------BookingSchema Interface-----
interface BookingType {
    roomType: string;
    count: number;
}
interface IBooking {
    _id: string;
    user: string;
    hotel: string;
    status: string;
    price: number;
    startDate: Date;
    endDate: Date;
    rooms: BookingType[];
    createdAt: Date;
  }

// ---------- GET /hotels/:id/reviews ----------
interface HotelReviewsQuery {
    selfPage: number;
    selfPageSize: number;
    otherPage: number;
    otherPageSize: number;
}

interface ReviewPagination {
    count
    prev?: number;
    next?: number;
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

interface HotelReviewsResponse extends GenericResponse {
    self: ReviewResponseSection;
    other: ReviewResponseSection;
}

// ---------- PUT /reviews/:id ----------
interface UpdateReviewBody {
    title?: string;
    rating?: number;
    text?: string;
}


// ---------- POST /reports ----------
interface CreateReportBody {
    review: string;
    reportReason: string;
}

// ---------- POST /user ----------
interface CreateUserBody {
    name?: string;
    picture?: string;
    tel?: string;
    password?: string;
}

interface CreateUserResponse extends GenericResponse{
    picture?: string;
    name?: string;
    tel?: string;
    token?: string;
}



// ---------- Bookings Request ----------
interface BookingsRequest {
    hotel: string;
    user: string;
    status?: string;
    price: number;
    startDate: Date;
    endDate: Date;
    rooms: {
        roomType: string;
        count: number;
    }[];
}


//---------GET /bookings-----------
interface PBooking {
    _id: string;
    user: IUser;
    hotel: IHotel;
    status: string;
    price: number;
    startDate: Date;
    endDate: Date;
    rooms: BookingType[];
    createdAt: Date;
}
interface BookingResponse extends GenericResponse{
    count: number;
    bookings?:PBooking[];
    booking?:PBooking;
}