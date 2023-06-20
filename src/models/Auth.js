const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const authSchema = mongoose.Schema({
    email : {
        type : String,
        require : true,
        trim : true,
        unique : true
    },
    password : {
        type : String,
        require : true,
        minLength : 8,
        trim : true
    },
    displayName : {
        type : String,
        require : true,
        maxLength : 20
    },
    profileImgBase64 : String,
    cart : {
        type : Array,
        default : []
    },
    history : {
        type : Array,
        default : []
    }
})

authSchema.pre('save', async function(next) {
    let auth = this

    if(auth.isModified('password' || 'newPassword')) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(auth.password, salt)

        auth.password = hash
    }

    next()
})

authSchema.methods.comparePassword = async function (plain) {
    let auth = this
    const match = await bcrypt.compare(plain, auth.password)

    return match
}

const Auth = mongoose.model('Auth', authSchema)

module.exports = Auth