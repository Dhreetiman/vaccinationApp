const mongoose = require('mongoose')


const checkInput = (value) => {
    return (Object.keys(value).length > 0);
}


const isValidInput = function (value) {

    if (typeof value === "undefined" || typeof value === "null") {
        return false
    }
    if (typeof value === "string" && value.trim().length == 0) {
        return false
    }
    return true
}

function checkName(str) {
    var re = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g
    let bool = re.test(str.trim());
    if (bool == true) {
        str = str.trim()
        str = str.toLowerCase().replace(str[0], str[0].toUpperCase())
        return str
    } else {
        return false
    }
}

const isValidpassword = (value) => {
    return (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(value));
}

const isValidMobileNumber = (value) => {
    return ((/^((\+91)?|91)?[6789][0-9]{9}$/g).test(value));
}

const isValidPin = (value) => {
    return (/^[1-9][0-9]{5}$/).test(value)
}

const isValidObjectId = (value) => {
    return mongoose.isValidObjectId(value)
}

const isValidNum = (value) => {
    return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(value);
}

const isValidAadhar = (value) => {
    return ((/(^[0-9]{4}[0-9]{4}[0-9]{4}$)|(^[0-9]{4}\s[0-9]{4}\s[0-9]{4}$)|(^[0-9]{4}-[0-9]{4}-[0-9]{4}$)/).test(value))
}

const isValidDate = (value) => {
    return (/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).test(value)
}

const isValidCity = (value) => {
    return (/^[a-zA-Z ]*$/).test(value)
}
module.exports = {
    checkInput,
    isValidInput,
    checkName,
    isValidpassword,
    isValidMobileNumber,
    isValidPin,
    isValidObjectId,
    isValidNum,
    isValidAadhar,
    isValidDate,
    isValidCity
}