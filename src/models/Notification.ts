import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'photo_approved' | 'photo_rejected' | 'contest_won' | 'contest_ending' | 'vote_milestone' | 'badge_earned' | 'welcome'
  message: string
  photoId: mongoose.Types.ObjectId | null
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['photo_approved', 'photo_rejected', 'contest_won', 'contest_ending', 'vote_milestone', 'badge_earned', 'welcome'],
    required: true,
  },
  message: { type: String, required: true },
  photoId: { type: Schema.Types.ObjectId, ref: 'Photo', default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
})

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
export default Notification
