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
    rating?:number;
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
    redeemableId: string | IRedeemable[];
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
    createdAt: string;
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
    createdAt: string;
  }

//-------ReportSchema Interface------
interface IReport {
    _id: string;
    review: string;
    reportDate: string;
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
    startDate: string;
    endDate: string;
    rooms: BookingType[];
    createdAt: string;
  }

// ---------- GET /hotels/:id/reviews ----------
interface HotelReviewsQuery {
    selfPage: number;
    selfPageSize: number;
    otherPage: number;
    otherPageSize: number;
}

interface ReviewPagination {
    count: number;
    prev?: number;
    next?: number;
}

interface Review {
    userName: string;
    picture: string;
    stayMonth: string;
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
    startDate: string;
    endDate: string;
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
    startDate: string;
    endDate: string;
    rooms: BookingType[];
    createdAt: string;
}
interface BookingResponse extends GenericResponse{
    count: number;
    bookings?:PBooking[];
    booking?:PBooking;
}

//-------GET /redeemables/gifts--------

interface RedeemableGiftsQuery{
    page: number;
    pageSize: number;
}

interface RedeemableGiftsData{
    id: string;
    name: string;
    point: number;
    remain: number;
}

interface RedeemableGiftsResponse extends GenericResponse, Pagination{
    data:RedeemableGiftsData[];
}

//--------GET /redeemables/gifts/:id-----------

interface RedeemableGiftResponse extends GenericResponse{
    id: string;
    name: string;
    description?: string;
    point: number;
    picture?: string;
    remain: number;
}

//--------GET /redeemables/coupons--------

interface RedeemableCouponsQuery{
    page: number;
    pageSize: number;
}

interface RedeemableCouponsData{
    id: string;
    name: string;
    point: number;
    discount: number;
    expire: string;
    remain: number;
}

interface RedeemableCouponsResponse extends GenericResponse, Pagination{
    data: RedeemableCouponsData[];
}

//------POST /redeemables/creation (for admin to add redeemables)-----

type RedeemableType = 'gift' | 'coupon';

interface CreateRedeemableBody{
    type: RedeemableType;
    name: string;
    point: number;
    remain: number;
    picture?: string; 
    description?: string;
    discount?: number;
    expire?: string;
}

//-----POST /redeemables/redemption (for user to redeem)----

interface CreateRedeemableRedemptionBody{
    id:string;
}
interface CreateRedeemableRedemptionResponse extends GenericResponse{
    remain: number;
}

//------GET /inventory/gifts-----

interface InventoryGiftsQuery{
    page: number;
    pageSize: number;
}

interface InventoryGiftsData{
    id: string;
    name: string;
    point: number;
    discount: number;
    expire: string;
    remain: number;
}

interface InventoryGiftsResponse extends GenericResponse, Pagination{
    total: number;
    data: InventoryGiftsData[];
}

//------GET /inventory/coupons-----

interface InventoryCouponsQuery{
    page: number;
    pageSize: number;
}

interface InventoryCouponsData{
    id: string;
    name: string;
    point: number;
    discount: number;
    expire: string;
    remain: number;
}

interface InventoryCouponsResponse extends GenericResponse, Pagination{
    total: number;
    data: InventoryCouponsData[];
}


//------Admin Sprint2-----------
//-----GET /redeemables/price-to-point-------

interface RedeemablePriceToPointResponse extends GenericResponse{
    priceToPoint: number;
}

//-----POST /redeemables/price-to-point------

interface CreateRedeemablePriceToPointBody{
    priceToPoint: number;
}

interface CreateRedeemablePriceToPointResponse extends GenericResponse{
    priceToPoint: number;
}

//-----GET /users/points-----

interface UsersPointsQuery{
    page: number;
    pageSize: number;
}

interface UsersPointsData{
    id: string;
    name: string;
    email: string;
    point: number;
}

interface UsersPointsResponse extends GenericResponse, Pagination{
    data: UsersPointsData[];
}

//------PUT /users/points/:id------

interface UpdateUserPointBody {
    point: number;
}

interface UpdateUserPointResponse extends GenericResponse{
    point: number;
}