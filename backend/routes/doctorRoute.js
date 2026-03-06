import express from 'express'
import { doctorsList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorsList)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor,appointmentsDoctor)
doctorRouter.post('/appointment-complete', authDoctor, appointmentComplete)
doctorRouter.post('/appointment-cancel', authDoctor, appointmentCancel)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

export default doctorRouter