const userModel = require('../model/userModel')
const validator = require('../validator/validator')
const timeSlotModel = require('../model/timeSlotModel')
const bookingModel = require('../model/bookingModel')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
    try {
        let data = req.body
        let {Name, phoneNumber, password, age, pincode, aadhar, ...rest} = data

        if (!validator.checkInput(data)) return res.status(400).send({ status: false, message: "Body cannot be empty, Please provide mandatory fields i.e. Name, phone, password, age, pincode, aadhar" });
        if (validator.checkInput(rest)) return res.status(400).send({ status: false, message: "Provide only Name, phoneNumber, password, age, pincode, aadhar." })

        if (!validator.isValidInput(Name)) return res.status(400).send({status: false, message: "Please Enter Name"})
        if (!validator.checkName(Name)) return res.status(400).send({status: false, message: "Name should be alphabet only"})
        data.Name = validator.checkName(Name)

        if (!validator.isValidInput(phoneNumber)) return res.status(400).send({status: false, message: "Please Enter phoneNumber"})
        if (!validator.isValidMobileNumber(phoneNumber)) return res.status(400).send({status: false, message: "INVALID INPUT... Please provide a valid phone Number"})

        if (!validator.isValidInput(password)) return res.status(400).send({status: false, message: "Please Enter Password"})
        if (!validator.isValidpassword(password)) return res.status(400).send({status: false, message: "Invalid Password Format. password should be have minimum 8 character and max 15 character and must contains one number, one uppar alphabet, one lower alphabet and one special character"})

        if (typeof age == 'number'){
            if (age > 120 || age < 5) return res.status(400).send({status: false, message: "To register here age must be more than 5 and less than 120"})
        }else{
            return res.status(400).send({status: false, message: "Age should be only in number"})
        }
        
        if (typeof pincode == 'number'){
            if (!validator.isValidPin(pincode)) return res.status(400).send({status: false, message: "INVALID INPUT... please provide a valid pincode"})
        }else{
            return res.status(400).send({status: false, message: "Pincode should be only in number"})
        }
        if (!validator.isValidInput(aadhar)) return res.status(400).send({status: false, message: "Please enter aadhar"})
        if (!validator.isValidAadhar(aadhar)) return res.status(400).send({status: false, message: "INVALID INPUT... please enter a valid aadhar Number"})

        let isDuplicate = await userModel.findOne({$or: [{phoneNumber: phoneNumber}, {aadhar: aadhar}]})
        if (isDuplicate){
            if (isDuplicate.phoneNumber==phoneNumber) return res.status(409).send({status: false, message: `Given phoneNumber: ${phoneNumber} already exist`})
            if (isDuplicate.aadhar==aadhar) return res.status(409).send({status: false, message: `Given aadhar: ${aadhar} already exist`})
        }

        let userData = await userModel.create(data)
        return res.status(201).send({status: true, message: "user Created successfully", data: userData})
        
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


const loginUser = async (req, res) => {
    try {
        let data = req.body
        let {phoneNumber, password, ...rest} = data

        if (!validator.checkInput(data)) return res.status(400).send({ status: false, message: "Please provide phoneNumber and password to login" });
        if (validator.checkInput(rest)) return res.status(400).send({ status: false, message: "this field accepts only phoneNumber and password" }) 

        if (!validator.isValidInput(phoneNumber)) return res.status(400).send({ status: false, message: "Please enter phoneNumber" })
        if (!validator.isValidMobileNumber(phoneNumber)) return res.status(400).send({ status: false, message: "INVALID INPUT... please provide a valid phoneNumber" })

        if (!validator.isValidInput(password)) return res.status(400).send({ status: false, message: "Please enter password" })
        if (!validator.isValidpassword(password)) return res.status(400).send({status: false, message: "Invalid Password Format. password should be have minimum 8 character and max 15 character and must contains one number, one uppar alphabet, one lower alphabet and one special character"})

        let checkUser = await userModel.findOne({phoneNumber: phoneNumber, password: password}).select({__v:0})
        if (!checkUser) return res.status(400).send({ status: false, message: "Incorrect phoneNumber or Password"})

        let token = jwt.sign({Id : checkUser._id, category: 'User'}, 'shhh', {expiresIn: '1h'})
        if (!token) return res.status(400).send({ status: false, message: "something went wrong"})
        res.setHeader('token',token)

        let obj = {token: "Token has been sent in Header", UserDetails: checkUser}
        return res.status(200).send({status: true, message: "login successfull", data: obj})


    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
} 


const getVaccineSlot = async (req, res) => {
    try {
        let data = req.query
        let userId = req.params.userId
        // console.log(Object.keys(data).length);
        let {date, pincode, ...rest} = data

        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "please provide a valid userId" })



        if (Object.keys(data).length > 2) return res.status(400).send({ status: false, message: "choose only one option to find vaccine details i.e. date, pincode" })

        if (validator.checkInput(rest)) return res.status(400).send({ status: false, message: "this field accepts only pincode and vaccineCenter" })

        if (!date) return res.status(400).send({ status: false, message: "Please provide date to fetch vaccination details" })
        if (!validator.isValidInput(date)) return res.status(400).send({ status: false, message: "please enter date" })
        if (!validator.isValidDate(date)) return res.status(400).send({ status: false, message: "Date format should be YYYY-MM-DD" })

        if (!pincode) return res.status(400).send({ status: false, message: "Please provide pincode to fetch vaccination details" })
        if (!validator.isValidInput(pincode)) return res.status(400).send({ status: false, message: "Please enter pincode" })
        pincode = Number(pincode)
        if (!pincode) return res.status(400).send({ status: false, message: "pincode should be only number" })
        

        let vaccineData = await timeSlotModel.find({$and: [{date: date}, {pincode: pincode}]}).select({__v:0, _id:0})
        if (!vaccineData) return res.status(404).send({status: false, message: "Data not found"})
        return res.status(200).send({status: true, data: vaccineData})
    
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


const bookVaccineSlot = async (req, res) => {
    try {
        let data = req.body
        let userId = req.params.userId
        let {date, pincode, vaccineCenter,timeSlot, ...rest} = data

        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Given user id is not valid" })

        if (!validator.checkInput(data)) return res.status(400).send({ status: false, message: "body cannot be empty, please provide mandatory fields i.e. date, pincode, vaccineCenter,timeSlot" });
        if (validator.checkInput(rest)) return res.status(400).send({ status: false, message: "Provide only date, pincode, vaccineCenter,timeSlot." })

        if (!validator.isValidInput(date)) return res.status(400).send({status: false, message: "Please Enter Date"})
        if (!validator.isValidDate(date)) return res.status(400).send({ status: false, message: "Date should be in YYYY-MM-DD format" })

        if (typeof pincode != 'number') return res.status(400).send({status: false, message: "pincode must be Number"})
        if (!validator.isValidPin(pincode)) return res.status(400).send({status: false, message: "INVALID INPUT... please provide a valid pincode"})

        if (!validator.isValidInput(vaccineCenter)) return res.status(400).send({status: false, message: "Please enter vaccineCenter"})
        if (!validator.isValidCity(vaccineCenter)) return res.status(400).send({status: false, message: "Please provide a valid city"})

        let slotArr = ["10:00AM-10:30AM","10:30AM-11:00AM","11:00AM-11:30AM","11:30AM-12:00PM","01:00PM-01:30PM","01:30PM-02:00PM","02:00PM-02:30PM","02:30PM-03:00PM","03:00PM-03:30PM","03:30PM-04:00PM"]

        if (!slotArr.includes(timeSlot)) return res.status(400).send({status: false, message: `Choose one of these for timeSlot ["10:00AM-10:30AM","10:30AM-11:00AM","11:00AM-11:30AM","11:30AM-12:00PM","01:00PM-01:30PM","01:30PM-02:00PM","02:00PM-02:30PM","02:30PM-03:00PM","03:00PM-03:30PM","03:30PM-04:00PM"]`})


        let checkData = await timeSlotModel.findOne({$and: [{date: date}, {pincode: pincode}, {vaccineCenter: {$regex: vaccineCenter}}]}).lean()

        if (checkData.totalVaccineAvailable==0) return res.status(400).send({status: false, message: "vaccine not available"})

        if (checkData.timeSlots[timeSlot]=="Unavailable") return res.status(400).send({status: false, message: "Given timeslot is not available"})

        if (!checkData) return res.status(404).send({status: false, message: "Data not found for given details"})

        let userData = await userModel.findById(userId).select({_id: 0, __v:0, createdAt: 0, updatedAt: 0}).lean()
        if (!userData) return res.status(404).send({status: false, message: "User does not exist"})
        if (userData.vaccinationStatus=="All Completed") return res.status(400).send({status: false, message: "You have already completed both dose"})

        let bking = await bookingModel.findOne({userId:userId})
        if (bking) {
            if (bking.status=='pending') return res.status(409).send({status: false, message: "You have already booked your vaccine slot", data: bking})
        }

        data.message = `Your vaccine slot has been successfully booked on Date: ${date} on timeSlot: ${timeSlot}`
        data.userId = userId



        let newData = await timeSlotModel.findOneAndUpdate({$and: [{date: date}, {pincode: pincode}, {vaccineCenter: {$regex: vaccineCenter}}]}, {$inc:{totalVaccineAvailable: -1}},{new: true})

        let bookingData = await bookingModel.create(data)
        
        userData.bookingDetails = bookingData


        return res.status(201).send({status: true, message: " successful", data: userData})
        
        
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}



module.exports = {registerUser, loginUser, getVaccineSlot, bookVaccineSlot}

