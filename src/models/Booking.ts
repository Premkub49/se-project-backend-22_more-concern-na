import mongoose from "mongoose";

interface BookingType{
    roomType: string,
    count: number
}
export interface IBooking {
    _id: mongoose.Schema.Types.ObjectId;
    user:mongoose.Schema.Types.ObjectId,
    hotel: mongoose.Schema.Types.ObjectId,
    status: string,
    price: number,
    startDate: Date,
    endDate: Date,
    rooms: BookingType[]

}

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    status: {
        type: String,
        enum: ["reserved", "checkedIn", "completed"],
        default: "reserved",
    },
    price: {
        type: Number,
        required: [true, "Please add a price"]
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    rooms: {
        type: Array,
        required: true,
        properties: {
            roomType: {
                type: String,
                required: [true, "Please add a room type"],
            },
            count: {
                type: Number,
                required: [true, "Please add a number of rooms"],
            },
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})
