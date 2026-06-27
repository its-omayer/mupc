import mongoose, { Schema, Document } from 'mongoose'

export interface IPhotographer extends Document {
  name: string
  userId: mongoose.Types.ObjectId | null
  wins: number
  bestPhotoUrl: string | null
  bestPhotoPublicId: string | null
  bio: string
  addedAt: Date
}

const PhotographerSchema = new Schema<IPhotographer>({
  name: { type: String, required: true, unique: true, trim: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  wins: { type: Number, default: 0 },
  bestPhotoUrl: { type: String, default: null },
  bestPhotoPublicId: { type: String, default: null },
  bio: { type: String, default: '' },
  addedAt: { type: Date, default: () => new Date() },
})

PhotographerSchema.index({ wins: -1 })

const Photographer = mongoose.models.Photographer || mongoose.model<IPhotographer>('Photographer', PhotographerSchema)
export default Photographer
