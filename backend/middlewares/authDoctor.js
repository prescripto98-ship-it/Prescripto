import jwt from 'jsonwebtoken'

// doctor authentication middleware

const authDoctor = async (req, res, next) => {
    try {
        
        const {dtoken} = req.headers
        if(!dtoken){
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        req.doctorId = token_decode.id
        next()

    } catch (error) {
        console.log(error)
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Session expired. Please login again." })
        }
        res.json({ success: false, message: error.message })        
    }
}

export default authDoctor