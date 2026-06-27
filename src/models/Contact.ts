import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  message: string
  submittedAt: Date
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: () => new Date() },
})

const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
export default Contact
