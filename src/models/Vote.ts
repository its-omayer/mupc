import mongoose, { Schema, Document } from 'mongoose'

export interface IVote extends Document {
  photoId: mongoose.Types.ObjectId
  voterId: mongoose.Types.ObjectId
  contestWeek: string
  votedAt: Date
}

const VoteSchema = new Schema<IVote>({
  photoId: { type: Schema.Types.ObjectId, ref: 'Photo', required: true },
  voterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contestWeek: { type: String, required: true },
  votedAt: { type: Date, default: () => new Date() },
})

VoteSchema.index({ voterId: 1, contestWeek: 1, photoId: 1 }, { unique: true })

const Vote = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema)
export default Vote
