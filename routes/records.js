const express = require('express')
const router = express.Router()
const Record = require('../models/record')

router.get('/', async (req, res) => {
    try {
        const records = await Record.find()
        res.json(records)
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})

router.get('/:id', getRecord, (req, res) => {
    res.json(res.record)
})

router.post('/', async (req, res) => {
    const record = new Record({
        username: req.body.username,
        time: req.body.time
    })

    try {
        const newRecord = await record.save()
        res.status(201).json(newRecord)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.patch('/:id', getRecord, async (req, res) => {
    if (req.body.username != null) {
      res.record.username = req.body.username
    }
    if (req.body.time != null) {
      res.record.time = req.body.time
    }
    try {
      const updatedRecord = await res.record.save()
      res.json(updatedRecord)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  })

router.delete('/:id', getRecord, async (req, res) => {
   try {
       await res.record.remove()
       res.json({ message: 'Deleted record' })
   } catch (error) {
       res.status(500).json({ message: error.message })
   }
})

async function getRecord(req, res, next) {
    let record
    try {
      record = await Record.findById(req.params.id)
      if (record == null) {
        return res.status(404).json({ message: 'Cannot find record' })
      }
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  
    res.record = record
    next()
  }

module.exports = router