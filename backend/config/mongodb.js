import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connected'))
        mongoose.connection.on('error', (err) => console.log('Database connection error:', err))
        
        await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)
        console.log('MongoDB connected successfully')
    } catch (error) {
        console.log('Connection error:', error.message)
        process.exit(1)
    }
}

export default connectDB