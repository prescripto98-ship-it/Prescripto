import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body
        if (!docId) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' })
        }

        const docData = await doctorModel.findById(docId)
        if (!docData) {
            return res.status(404).json({ success: false, message: 'Doctor not found' })
        }

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability Changed Successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const doctorsList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//API for doctor login

const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Invalid Credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {

            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.status(401).json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const docId = req.doctorId
        console.log('Doctor ID from token:', docId)

        if (!docId) {
            return res.status(401).json({ success: false, message: 'Doctor ID not found in token' })
        }

        const appointments = await appointmentModel.find({ docId })
        console.log('Appointments found:', appointments.length)
        res.json({ success: true, appointments })

    } catch (error) {
        console.log('Error fetching appointments:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//API to mark appointment as completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const docId = req.doctorId

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'Appointment ID is required' })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.docId === docId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment completed' })

        } else {
            return res.json({ success: false, message: 'Mark Failed' })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const docId = req.doctorId

        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'Appointment ID is required' })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found' })
        }

        if (appointmentData.docId === docId) {

            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment cancelled' })

        } else {
            return res.json({ success: false, message: 'Cancellation Failed' })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel

const doctorDashboard = async (req, res) => {
    try {

        const docId = req.doctorId

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            appointments: appointments.length,
            earnings,
            patients: patients.length,
            latestAppointments: appointments.slice(0, 5).reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
    try {

        const docId = req.doctorId

        if (!docId) {
            return res.status(401).json({ success: false, message: 'Doctor ID not found in token' })
        }

        const doctor = await doctorModel.findById(docId).select('-password')

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' })
        }

        res.json({ success: true, profileData: doctor })

    } catch (error) {
        console.log('Error in doctorProfile:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

//API to update doctor profile for doctor panel
const updateDoctorProfile = async (req, res) => {
    try {

        const docId = req.doctorId
        const { fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated Successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export { changeAvailability, doctorsList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile }