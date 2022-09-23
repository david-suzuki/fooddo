const mongoose = require("mongoose");

const User = mongoose.Schema({
    accepting_payment_allowed:{type: String},
    outlet_uuid:{type: String},
    user_email:{type: String},
    user_mid:{type: String},
    user_name:{type: String},
    user_password:{type: String},
    user_status:{type: String},
    user_title:{type: String},
    user_type:{type: String},
    user_uuid:{type: String},
    usmer_mobile_number:{type: String},
})

module.exports = mongoose.model("user",User);