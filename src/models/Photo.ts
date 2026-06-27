import mongoose, { Schema, Document } from 'mongoose'

export interface IPhoto extends Document {
  cloudinaryPublicId: string
  cloudinaryUrl: string
  title: string
  photographerName: string
  uploadedBy: mongoose.Types.ObjectId
  type: 'contest' | 'gallery'
  contestWeek: string | null
  votes: number
  views: number
  weekRank: number | null
  status: 'pending' | 'approved' | 'rejected'
  tags: string[]
  uploadedAt: Date
}

const PhotoSchema = new Schema<IPhoto>({
  cloudinaryPublicId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  photographerName: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['contest', 'gallery'], required: true },
  contestWeek: { type: String, default: null },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  weekRank: { type: Number, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  tags: {
    type: [String],
    enum: ['Street', 'Portrait', 'Landscape', 'Architecture', 'Wildlife', 'Abstract', 'Documentary', 'Night'],
    default: [],
  },
  uploadedAt: { type: Date, default: () => new Date() },
})

PhotoSchema.index({ type: 1, contestWeek: 1, status: 1 })
PhotoSchema.index({ uploadedBy: 1, contestWeek: 1 })
PhotoSchema.index({ photographerName: 1, type: 1 })
PhotoSchema.index({ status: 1 })

const Photo = mongoose.models.Photo || mongoose.model<IPhoto>('Photo', PhotoSchema)
export default Photo
