import mongoose, { Schema, Document } from 'mongoose'

export interface IContestWeek extends Document {
  weekId: string
  endDate: Date
  isActive: boolean
  winnersSelected: boolean
  totalPhotos: number
  totalVotes: number
  createdAt: Date
}

const ContestWeekSchema = new Schema<IContestWeek>({
  weekId: { type: String, required: true, unique: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  winnersSelected: { type: Boolean, default: false },
  totalPhotos: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
})

ContestWeekSchema.index({ isActive: 1 })

const ContestWeek = mongoose.models.ContestWeek || mongoose.model<IContestWeek>('ContestWeek', ContestWeekSchema)
export default ContestWeek
