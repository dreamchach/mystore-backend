const jwt = require("jsonwebtoken")
const Auth = require("../models/Auth")

let auth = async (req, res, next) => {
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    if(token === null) {
        return res.status(401).send('토큰이 존재하지 않습니다')
    }

    try {
        const decode = jwt.verify(token, process.env.jwt)
        /*
        {
            userId: '648c0551a73e0c5de2b2246d',
            iat: 1686907289,
            exp: 1686993689
        }
        */
        const user = await Auth.findOne({'_id' : decode.userId})

        if(!user) {
            return res.status(400).send('없는 유저입니다')
        }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = auth