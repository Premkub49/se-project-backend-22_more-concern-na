import mongoose, { ObjectId } from 'mongoose';
export const reportReasons = [ 
  'pedo',
  'bully',
  'suicide',
  'violence',
  'nsfw',
  'spam',
  'scam',
  'other'];
export interface IReport {
  _id: ObjectId;
  review: ObjectId;
  reportDate: Date;
  reportReason: string;
  isIgnore: boolean;
}

const ReportSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  reportDate: {
    type: Date,
    default: () => Date.now(),
  },
  reportReason: {
    type: String,
    enum: [
      'pedo',
      'bully',
      'suicide',
      'violence',
      'nsfw',
      'spam',
      'scam',
      'other',
    ],
    required: [true, 'Please add a report reason'],
  },
  isIgnore: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Report', ReportSchema);
