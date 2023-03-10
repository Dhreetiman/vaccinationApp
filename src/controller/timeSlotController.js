const timeSlotModel = require('../model/timeSlotModel')
const adminModel = require("../model/adminModel")
const validator = require('../validator/validator')

const createVaccineSlot = async (req, res) => {
    try {
        let data = req.body
        let token = req.token
        let {date, vaccineCenter, totalVaccineAvailable, timeSlots, pincode, ...rest} = data

        let checkAdmin = await adminModel.findById(token)
        if (!checkAdmin) return res.status(400).send({ status: false, message: "Only admins was authorized to perform this task" })

        if (!validator.checkInput(data)) return res.status(400).send({ status: false, message: "Body cannot be empty, please provide mandatory fields, i.e. date, totalVaccineAvailable, timeSlots, pincode, vaccineCenter" });
        if (validator.checkInput(rest)) return res.status(400).send({ status: false, message: "this field accepts only date, totalVaccineAvailable, timeSlots, pincode" }) 

        if (!validator.isValidInput(date)) return res.status(400).send({status: false, message: "Please Enter Date"})
        if (!validator.isValidDate(date)) return res.status(400).send({ status: false, message: "Date should be in YYYY-MM-DD format" })

        if (typeof pincode != 'number') return res.status(400).send({status: false, message: "pincode must be Number"})
        if (!validator.isValidPin(pincode)) return res.status(400).send({status: false, message: "INVALID INPUT... please provide a valid pincode"})

        if (!validator.isValidInput(vaccineCenter)) return res.status(400).send({status: false, message: "Please enter vaccineCenter"})
        if (!validator.isValidCity(vaccineCenter)) return res.status(400).send({status: false, message: "Please provide a valid city"})

        if (typeof totalVaccineAvailable != 'number') return res.status(400).send({status: false, message: "This field accepts only Number"})
        if (!validator.isValidNum(totalVaccineAvailable)) return res.status(400).send({status: false, message: "Please enter a valid number"})

        let isDuplicateData = await timeSlotModel.findOne({$and: [{date: date}, {vaccineCenter: vaccineCenter}, {pincode: pincode}]})
        if (isDuplicateData) return res.status(409).send({ status: false, message: "Data has been already created for this date and place" })

        let vaccineData = await timeSlotModel.create(data)

        return res.status(201).send({status: true, message: "successful", data: vaccineData})


    } catch (error) {
        if (error._message=="Timeslot validation failed") {
            return res.status(400).send({ status: false, message: error.message })
        }else{
            return res.status(500).send({ status: false, message: error.message })
        }
        
    }
}

module.exports = {createVaccineSlot}