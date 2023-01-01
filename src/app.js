const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/route')
const app = express()

app.use(express.json())
app.use('/', router)

mongoose.set("strictPopulate",false)

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://Lucifer:lucifer123@cluster1.578aivq.mongodb.net/VaccinationApp?retryWrites=true&w=majority', {useNewUrlParser: true})
.then(()=>console.log("MongoDB Connected"))
.catch((err)=> console.log(err))

app.listen(process.env.PORT || 6000, () => {
    console.log("Express is running on port", (process.env.PORT || 6000));
})

