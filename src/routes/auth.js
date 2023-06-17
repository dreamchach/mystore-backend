const express = require('express')
const router = express.Router()
const Auth = require('../models/Auth')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')

router.post('/signup', (req, res, next) => {
    try {
        if(!req.body.email || !req.body.password || !req.body.displayName){
            return res.status(400).send('필수 정보가 입력되지 않았습니다')
        }else {
            const auth = new Auth(req.body)
            const payload = {
                userId : auth._id.toHexString()
            }
            const accessToken = jwt.sign(payload, process.env.jwt, {expiresIn : '24h'})

            auth.save()
    
            return res.json({auth, accessToken})
        }
    } catch (error) {
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('필수정보가 입력되지 않았습니다')
        }
        const auth = await Auth.findOne({email : req.body.email})
        const match = await auth.comparePassword(req.body.password)
        const payload = {
            userId : auth._id.toHexString()
        }
        const accessToken = jwt.sign(payload, process.env.jwt, {expiresIn : '24h'})

        if(!auth) {
            return res.status(400).send('email not found')
        }
        if(!match) {
            return res.status(400).send('wrong password')
        }

        return res.json({auth, accessToken})
    } catch (error) {
        next(error)
    }
})

router.get('/me', auth, async(req, res, next) => {
    try {
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]
        const decode = jwt.verify(token, process.env.jwt)
        const user = await Auth.findOne({'_id' : decode.userId})

        return res.json({user})
    } catch (error) {
        next(error)
    }
})

router.get('/logout', auth, async(req, res, next) => {
    try {
        return res.status(200).json({ResponseValue : true})
    } catch (error) {
        next(error)
    }
})

router.put('/user', auth, async(req, res, next) => {
    try {
        const header = req.headers['authorization']
        const token = header && header.split(' ')[1]
        const decode = jwt.verify(token, process.env.jwt)
        const user = await Auth.findOne({_id : decode.userId})
        const match = await user.comparePassword(req.body.oldPassword)

        if(match) {
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(req.body.newPassword, salt)

            await Auth.findOneAndUpdate(
                {_id : decode.userId},
                {$set: {password : hash}},
                {new : true}
            )

            return res.status(200).send('비밀번호가 성공적으로 변경되었습니다')
        }else {
            return res.status(400).send('비밀번호가 일치하지 않습니다')
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router