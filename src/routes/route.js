const express = require('express');
const router = express.Router()
const {registerUser, loginUser, getVaccineSlot, bookVaccineSlot} = require('../controller/userController')
const {loginAdmin, getUserList} = require('../controller/adminController')
const {createVaccineSlot} = require('../controller/timeSlotController')
const middleware = require('../middleware/auth')

router.get('/test', function(req, res) {
    return res.status(200).send({status: true, message: 'API is working fine'})
})


router.post('/register', registerUser)

router.post('/login/user', loginUser)

router.post('/login/admin' , loginAdmin)

router.get('/user-list',middleware.Authentication, getUserList)

router.post('/vaccine',middleware.Authentication, createVaccineSlot)

router.get('/vaccine/details/:userId',middleware.Authentication, middleware.Authorization ,getVaccineSlot)

router.post('/vaccine/book/:userId', bookVaccineSlot)



module.exports = router