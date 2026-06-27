import mongoose, { Schema, Document } from 'mongoose'

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId
  action: string
  targetType: 'photo' | 'user' | 'contestweek' | 'photographer' | null
  targetId: mongoose.Types.ObjectId | null
  details: string
  createdAt: Date
}

const AdminLogSchema = new Schema<IAdminLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ['photo', 'user', 'contestweek', 'photographer'], default: null },
  targetId: { type: Schema.Types.ObjectId, default: null },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: () => new Date() },
})

AdminLogSchema.index({ createdAt: -1 })

const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema)
export default AdminLog
