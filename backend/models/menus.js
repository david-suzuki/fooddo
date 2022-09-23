const mongoose = require("mongoose");

const Menu = mongoose.Schema({
    last_updated_at: {type: Date},
    outlet_uuid:{type: String},
    brand_uuid:{type: String},
    date:{type: String},
    category_and_items:[{
        category_uuid:{type: String},
        menu_category_sort_order:{type: String},
        menu_items:[{
            item_uuid:{type: String},
            menu_item_uuid:{type: Number},
            menu_item_description:{type: String},
            menu_item_parcel_charge:{type: String},
            menu_item_parcel_tax:{type: String},
            menu_item_status:{type: String},
            menu_item_price:{type: String},
            menu_item_discount:{type: String},
            menu_item_recommended:{type: String},
            menu_item_sort_order:{type: String},
            menu_item_label:{type: String},
            menu_item_addons:[{
                addon_title:{type: String},
                addon_min:{type: String},
                addon_max:{type: String},
                addon_item_details:[{
                    item_uuid:{type: String},
                    menu_item_addon_uuid:{type:String},
                    price: {type:String}
                }]
            }],
            menu_item_multi:[{
                multi_title:{type: String},
                multi_item_details:[{
                    item_multi_name: {type:String},
                    menu_item_multi_uuid: {type:String},
                    item_multi_price: {type:String}
                }]
            }],
        }],
    }],
    menu_for:[],
    menu_type:[],
    menu_title:{type: String},
    menu_uuid:{type: String},
    meal_uuid:{type: String}
})

module.exports = mongoose.model("menu", Menu);
