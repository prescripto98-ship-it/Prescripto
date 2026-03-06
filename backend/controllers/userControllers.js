import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'

// API to register user
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email address' })
        }

        // validate password strength
        if (password.length < 8) {
            return res.json({ success: false, message: 'Enter a strong password (minimum 8 characters)' })
        }

        //hash user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, 
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.json({ success: true, token})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            return res.json({ success: true, token })
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to get user details
const getProfile = async (req, res) => {
    
    try {
        
        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to update user details
const updateProfile = async (req, res) => {
    try {

        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        await userModel.findByIdAndUpdate(userId, {name, phone, address : JSON.parse(address),dob, gender})

        if (imageFile) {
            // Upload image to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageUrl })
        }

        res.json({ success: true, message: 'Profile updated successfully' }) 
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment
const bookAppointment = async (req, res) => {

    try {

        const { docId, slotDate, slotTime } = req.body
        const userId = req.userId

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }

        let slots_booked = docData.slots_booked

        //checking for slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
            return res.json({ success: false, message: 'Slot not available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }
        
        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fee,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({ success: true, message: 'Appointment booked successfully' })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to get user appointments for frontend my-appointments page 

const listAppointments = async (req, res) => {

    try {
        
        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment (can be used in frontend my-appointments page)

const cancelAppointment = async (req, res) => {

    try {

        const userId = req.userId
        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify if the appointment belongs to the user
        if (appointmentData.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        const {docId, slotDate, slotTime} = appointmentData

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        }

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        res.json({ success: true, message: 'Appointment cancelled' })
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to make payment of appointment using razorpay
// Note: Razorpay integration will be added here

const paymentRazorpay = async (req, res) => {

    try {
        
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
        return res.json({ success: false, message: 'Appointment not found or already cancelled' })
        }

        // Razorpay order creation will be implemented here
        // For now, returning success with order details
        res.json({ success: true, message: 'Payment page loading', appointmentData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { registerUser, loginUser, getProfile , updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay }