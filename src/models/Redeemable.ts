import e from "express";
import mongoose from "mongoose";

export interface IRedeemable {
    type: string;
    name: string;
    description?: string;
    pointUse: number;
    discount?: number;
    remainCount: number;
}
const RedeemableSchema = new mongoose.Schema({
    type:{
        type: String,
        required: [true,'Please add a type'],
        enum: ['giftcard', 'coupon'],
    },
    name : { 
        type: String, 
        required: [true,'Please add a name'],
        trim: true 
    },
    description:{
        type: String,
    },
    pointUse:{
        type: Number,
        required: [true,'Please add a pointUse'],
    },
    discount:{
        type: Number,
    },
        remainCount:{
        type: Number,
        required: [true,'Please add a remainCount'],
    },
});

export default mongoose.model('Redeemable', RedeemableSchema);