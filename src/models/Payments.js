const mongoose = require('mongoose')

const authSchema = mongoose.Schema({
    detailId : {
        type : String
    }, 
    user : {
        type : Object
    },
    product : {
        type : Object
    },
    timePaid : {
        type : String
    },
    isCanceled : {
        type : Boolean,
        default : false
    },
    done : {
        type : Boolean,
        default : false
    }
})

const Auth = mongoose.model('Auth', authSchema)

module.exports = Auth