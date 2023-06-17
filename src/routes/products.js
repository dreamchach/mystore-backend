const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Products = require('../models/Products')
const multer = require('multer')
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

router.get('/', auth, async (req, res, next) => {
    try {
        if(!req.headers['masterkey']) {
            return res.status(500).send('관리자 계정이 아닙니다')
        }else {
            const products = await Products.find().populate()
            
            return res.status(200).json({products})
        }
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
        const products = req.body.searchText ? 
            await Products.find({title : req.body.searchText}) :
            await Products.find({tag : req.body.searchTag})
        
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

// 전체 거래(판매) 내역
// 거래(판매) 내역 완료/취소 및 해제
// 제품 거래(구매) 신청
// 제품 거래(구매) 취소
// 제품 거래(구매) 확정
// 제품 전체 거래(구매) 내역
// 단일 제품 상세 거래(구매) 내역

module.exports = router