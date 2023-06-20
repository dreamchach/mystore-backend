const mongoose = require('mongoose')

const paymentsSchema = mongoose.Schema({
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
    number : {
        type : Number
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

const Payments = mongoose.model('Payments', paymentsSchema)

module.exports = Payments