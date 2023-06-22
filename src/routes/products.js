const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Products = require('../models/Products')
const multer = require('multer')
const Auth = require('../models/Auth')
const async = require('async')
const Payments = require('../models/Payments')
const upload = multer({
    storage : multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, 'uploads/')
        },
        filename : (req, file, cb) => {
            cb(null, `${file.originalname}_${Date.now()}.jpg`)
        }
    })
})

router.post('/image', upload.single('file'), async (req, res, next) => {
    try {
        return res.status(200).json({fileName : req.file.filename})
    } catch (error) {
        return next(error)
    }
})

router.post('/', auth, async (req, res, next) => {
    try {
        if(!req.headers['masterkey']){
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            if(!req.body.title || !req.body.price || !req.body.description || !req.body.desc){
                return res.status(500).send('필수 정보가 입력되지 않았습니다')
            }else {
                let product = new Products(req.body)
                const data = {...req.body, productId : product._id.toHexString()}
                
                product = new Products(data)
                await product.save()
                return res.status(200).send('상품이 등록되었습니다')
            }
        }
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const products = await Products.find().populate()
            
        return res.status(200).json({products})
    } catch (error) {
        next(error)
    }
})

// 제품 수정
router.put('/:productId', auth, async (req, res, next) => {
    try {
        if(!req.headers['masterkey']) {
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            const product = await Products.findOneAndUpdate(
                {productId : req.params.productId},
                req.body,
                {new : true}
            )
            
            return res.status(201).send(product)
        }
    } catch (error) {
        next(error)
    }
})

// 제품 삭제
router.delete('/:productId', auth, async(req, res, next) => {
    try {
        if(!req.headers['masterkey']) {
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            await Products.findOneAndDelete({productId : req.params.productId})

            return res.status(200).send('상품이 삭제되었습니다')
        }
    } catch (error) {
        next(error)
    }
})

// 제품 검색
router.post('/search', async(req, res, next) => {
    try {
        const products = await Products.find({tag : req.body.searchTag})
        
        return res.status(200).json({products})
    } catch (error) {
        next(error)
    }
})

// 단일 제품 상세 조회
router.get('/:productId', async (req, res, next) => {
    try {
        const product = await Products.findOne({productId : req.params.productId})

        return res.status(200).json({product})
    } catch (error) {
        next(error)
    }
})

// 제품 거래 구매 신청
router.post('/buy', auth, async (req, res, next) => {
    try {
        const user = await Auth.findOne({email : req.body.email})
        let duplicate = false

        user.cart.forEach(element => {
            if(element.id === req.body.productId) {
                duplicate = true
            }
        });

        if(!duplicate) {
            let detailId = `${req.body.productId}_${req.body.email}_${Date.now()}`
            const data = {
                user : req.body.email,
                product : req.body.productId,
                timePaid : Date.now(),
                number : 1,
                detailId
            }
            let master = new Payments(data)
            
            await master.save()

            const userInfo = await Auth.findOneAndUpdate(
                {email : req.body.email},
                {$push : {
                    cart : {
                        id : req.body.productId,
                        qua : 1,
                        date : Date.now(),
                        detailId : detailId
                    }
                }},
                {new : true}
            )

            return res.status(201).send(userInfo.cart)

        } else {
            let detailId = ''
            const userInfo = await Auth.findOneAndUpdate(
                {email : req.body.email, 'cart.id' : req.body.productId},
                {$inc : {'cart.$.qua' : 1}},
                {new : true}
            )

            userInfo.cart.map((item) => {
                if(item.id === req.body.productId) {
                    detailId = item.detailId
                }
            })

            await Payments.findOneAndUpdate(
                {detailId : detailId},
                {$inc : {'number' : 1}},
                {new : true}
                )

            return res.status(201).send(userInfo.cart)
        }
    } catch (error) {
        next(error)
    }
})

// 제품 거래(구매) 취소
router.post('/cancel', auth, async (req, res, next) => {
    try {
        const userProduct = await Auth.findOneAndUpdate(
            {'cart' : {'$elemMatch' : {'detailId' : req.body.detailId}}},
            {'$pull' : {'cart' : {'detailId' : req.body.detailId}}},
            {new : true}
        )
        
        return res.status(201).json({userProduct})
    } catch (error) {
        next(error)
    }
})

// 제품 거래(구매) 확정
router.post('/ok', auth, async (req, res, next) => {
    try {
        let history = {}
        const productInfo = await Auth.findOne(
            {'cart' : {'$elemMatch' : {'detailId' : req.body.detailId}}}
        )
        
        productInfo.cart.map((item) => {
            if(item.detailId === req.body.detailId) {
                history = {...item}
            }
        })
        
        const product = await Auth.findOneAndUpdate(
            {'cart' : {'$elemMatch' : {'detailId' : req.body.detailId}}},
            {'$pull' : {'cart' : {'detailId' : req.body.detailId}}, '$push' : {history : history}},
            {new : true}
        )

        await Products.findOneAndUpdate(
            {productId : req.body.productId},
            {$inc : {'sold' : 1}},
            {new : true}
        )

        return res.status(200).send(product)
        
    } catch (error) {
        next(error)
    }
})

// 제품 전체 거래(구매) 내역
router.post('/transactions/details', auth, async (req, res, next) => {
    try {
        let history = []
        let product = []
        const user = await Auth.findOne({email : req.body.email})
        
        history = [...user.history]
        
        async.eachSeries(history, async (item) => {
            const productInfo = await Products.findOne({productId : item.id})
            product.push({data : productInfo, item})
        }, (err) => {
            if(err) {
                return res.status(500).send(err)
            }else {
                return res.status(200).send(product)
            }
        })
        
    } catch (error) {
        next(error)
    }
})

// 단일 제품 상세 거래(구매) 내역
router.post('/transactions/detail', auth, async (req, res, next) => {
    try {
        const product = await Auth.findOne({'history' : {'$elemMatch' : {'detailId' : req.body.detailId}}})
        let detail = product.history.filter((item) => {
            if(item.detailId === req.body.detailId) {
                return item
            }
        })
        const productInfo = await Products.findOne({productId : detail[0].id})
        
        return res.status(200).json({user : detail[0], productInfo})
    } catch (error) {
        next(error)
    }
})

// 전체 거래(판매) 내역
router.get('/transactions/all', auth, async (req, res, next) => {
    try {
        if(!req.headers['masterkey']) {
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            const sells = await Payments.find()
            let all = []

            async.eachSeries(sells, async (item) => {
                const productInfo = await Products.findOne({productId : item.product})
                all.push({data : productInfo, item})
            }, (err) => {
                if(err) {
                    return res.status(500).send(err)
                }else {
                    return res.status(200).send(all)
                }
            })
        }
    } catch (error) {
        next(error)
    }
})

// 거래(판매) 내역 완료/취소 및 해제(관리자)
router.put('/transactions/:detailId', auth, async (req, res, next) => {
    try {
        if(!req.headers['masterkey']) {
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            const product = await Payments.findOneAndUpdate(
                {detailId : req.params.detailId},
                req.body,
                {new : true}
            )
            return res.status(201).send(product)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router
