import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'admin' | 'member' | 'viewer'
  profilePhotoUrl: string | null
  profilePhotoPublicId: string | null
  bio: string
  badges: string[]
  savedPhotos: mongoose.Types.ObjectId[]
  isActive: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'viewer' },
  profilePhotoUrl: { type: String, default: null },
  profilePhotoPublicId: { type: String, default: null },
  bio: { type: String, default: '', maxlength: 300 },
  badges: { type: [String], default: [] },
  savedPhotos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
})

UserSchema.index({ role: 1 })

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
