const mongoose = require("mongoose");

const Meal = mongoose.Schema({
    meal_title:{type: String},
    sort_order:{type: String},
    status:{type: String},
    delivery_time:{type: Date},
    order_opening_hours:{type: Date},
    order_closing_hours:{type: Date},
    editing_allowed:{type: String},
    meal_uuid:{type: String},
    outlet_uuid:{type: String}
})

module.exports = mongoose.model("meal", Meal);