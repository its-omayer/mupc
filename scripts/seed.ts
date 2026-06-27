import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Create .env.local with MONGODB_URI=...')
  process.exit(1)
}

// Define schemas inline for seed script (avoids Next.js module resolution)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: { type: String, default: 'viewer' },
  profilePhotoUrl: { type: String, default: null },
  profilePhotoPublicId: { type: String, default: null },
  bio: { type: String, default: '' },
  badges: { type: [String], default: [] },
  savedPhotos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
})

const contestWeekSchema = new mongoose.Schema({
  weekId: String,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  winnersSelected: { type: Boolean, default: false },
  totalPhotos: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
})

const photographerSchema = new mongoose.Schema({
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  wins: { type: Number, default: 0 },
  bestPhotoUrl: { type: String, default: null },
  bestPhotoPublicId: { type: String, default: null },
  bio: { type: String, default: '' },
  addedAt: { type: Date, default: () => new Date() },
})

const UserModel = mongoose.models.User || mongoose.model('User', userSchema)
const ContestWeekModel = mongoose.models.ContestWeek || mongoose.model('ContestWeek', contestWeekSchema)
const PhotographerModel = mongoose.models.Photographer || mongoose.model('Photographer', photographerSchema)

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!')

  // Clear collections
  await UserModel.deleteMany({})
  await ContestWeekModel.deleteMany({})
  await PhotographerModel.deleteMany({})
  console.log('Cleared existing data')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12)
  const admin = await UserModel.create({
    email: 'admin@mupc.club',
    password: adminPassword,
    name: 'MUPC Admin',
    role: 'admin',
    bio: 'Official administrator of MUPC Photography Club.',
    badges: ['admin_badge'],
  })
  console.log(`Admin created: admin@mupc.club / Admin@1234`)

  // Create sample members
  const memberPassword = await bcrypt.hash('Member@1234', 12)
  const members = await UserModel.insertMany([
    {
      email: 'rahim@mupc.club',
      password: memberPassword,
      name: 'Rahim Chowdhury',
      role: 'member',
      bio: 'Street photography enthusiast from Dhaka.',
      badges: ['first_upload'],
    },
    {
      email: 'farida@mupc.club',
      password: memberPassword,
      name: 'Farida Begum',
      role: 'member',
      bio: 'Portrait and documentary photographer.',
      badges: ['first_upload', 'golden_frame'],
    },
    {
      email: 'karim@mupc.club',
      password: memberPassword,
      name: 'Karim Ahmed',
      role: 'member',
      bio: 'Landscape and wildlife photography.',
      badges: ['first_upload', 'silver_shutter'],
    },
  ])
  console.log(`Created ${members.length} members`)

  // Create photographers
  await PhotographerModel.insertMany([
    { name: 'Rahim Chowdhury', wins: 2, bio: 'Street photography enthusiast from Dhaka.', userId: members[0]._id },
    { name: 'Farida Begum', wins: 5, bio: 'Portrait and documentary photographer.', userId: members[1]._id },
    { name: 'Karim Ahmed', wins: 3, bio: 'Landscape and wildlife photography.', userId: members[2]._id },
    { name: 'Nurul Islam', wins: 1, bio: 'Architecture and urban photography.' },
    { name: 'Sajeda Akter', wins: 4, bio: 'Fine art and abstract photography.' },
  ])
  console.log('Created photographers')

  // Create active contest week
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 5)
  await ContestWeekModel.create({
    weekId: '2026-W25',
    endDate,
    isActive: true,
    winnersSelected: false,
  })
  console.log('Created active contest week: 2026-W25')

  console.log('\n✅ Seed complete!')
  console.log('Admin login: admin@mupc.club / Admin@1234')
  console.log('Admin portal: /bash-mubc-bash/login')
  console.log('Member login: rahim@mupc.club / Member@1234')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
