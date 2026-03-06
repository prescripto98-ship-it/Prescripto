import jwt from 'jsonwebtoken'

// admin authentication middleware

const authUser = async (req, res, next) => {
    try {
        
        const {token} = req.headers
        if(!token){
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = token_decode.id
        next()

    } catch (error) {
        console.log(error)
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Session expired. Please login again." })
        }
        res.json({ success: false, message: error.message })        
    }
}

export default authUser