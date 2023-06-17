const express = require('express')
const app = express()
const port = 5000
const mongoose = require('mongoose')
const env = require('dotenv')
const path = require('path')
const auth = require('./routes/auth')
const products = require('./routes/products')
const cors = require('cors')

env.config()

try {
    mongoose.connect(process.env.mongo)
    console.log('연결 완료')
} catch (error) {
    console.log(error)
}

app.use(express.json())
app.use(cors())

app.use('/api/auth', auth)
app.use('/api/products', products)

app.use('/image', express.static(path.join(__dirname, '../upload')))
app.use((error, res) => {
    res.status(error.status || 500)
    res.send(error.message || '서버에서 에러가 났습니다')
})

app.listen(port, () => {
    console.log('port', port)
})