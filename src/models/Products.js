const mongoose = require('mongoose')

const productsSchema = mongoose.Schema({
    productId : {
        type : String,
        require : true,
        unique : true
    },
    title : {
        type : String,
        require : true
    },
    price : {
        type : Number,
        trim : true,
        require : true,
        default : 0
    },
    description : {
        type : String,
        trim : true
    },
    desc : {
        type : String,
        trim : true,
        maxLength : 100
    },
    isSoldOut : {
        type : Boolean,
        default : false
    },
    tag : {
        type : String
    },
    thumbnail : {
        type : Array,
        default : []
    },
    photo : {
        type : Array,
        default : []
    },
    views : {
        type : Number,
        default : 0
    },
    sold : {
        type : Number,
        default : 0
    },
    transcationDetail : {
        type : Array,
        default : []
    }
})

const Products = mongoose.model('Products', productsSchema)

module.exports = Products