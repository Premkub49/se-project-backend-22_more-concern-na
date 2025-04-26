import mongoose, {ObjectId} from "mongoose";
export interface IData {
    name: string;
    value: any;
}
const DataSchema = new mongoose.Schema ({
    name: {
        type: String,
        require: [true, 'Please add name'],
        unique: true
    },
    value: {
    }
})

export default mongoose.model('Data', DataSchema, 'data');