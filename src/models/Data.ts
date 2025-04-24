import mongoose, {ObjectId} from "mongoose";
export interface IData {
    name: string;
    value: any;
}
const DataSchema = new mongoose.Schema ({
    name: {
        type: String,
        require: true
    },
    value: {
        require: true
    }
})

export default mongoose.model('Data', DataSchema, 'data');