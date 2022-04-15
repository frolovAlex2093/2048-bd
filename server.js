require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to db'))

app.use(express.json())

const recordsRouter = require('./routes/records')
app.use('/api/v1/record/', recordsRouter)

app.use(express.static(path.resolve(__dirname, 'game')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'game', 'index.html'))
})

app.listen(3000, () =>{
    console.log("started...")
})