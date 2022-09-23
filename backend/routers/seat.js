const express = require("express");

const router = express.Router()
const Seat = require("../models/seats");
const Menu = require("../models/menus");
const Item_categories = require("../models/item_categories");
const Item = require("../models/items");
const Outlet = require("../models/outlets");

router.post("/postSeat", (req, res)=>{
    body = req.body
    body.map((value)=>{
        Seat(value).save()
        .then(result=>{
            res.status(200).json({message:"added"})
        })
        .catch(err=>{
            res.status(err).json({messae: err})
        })
    })
})

router.put("/putSeat", (req,res)=>{
    body = req.body
    const temp = [];
    var i = 0
    console.log(body)
    const count = body.length
    body.map((value)=>{
        Seat.replaceOne({seat_uuid: value.seat_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.seat_uuid + " is updated")
                }
                else{
                    temp.push(value.seat_uuid + " match is not founded")
                }
            }else{
                temp.push(value.seat_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})

router.post("/getMenu", async (req, res)=>{
    try {
        const seat_uuid = req.body.seat_uuid
        const seat = await Seat.findOne({seat_uuid:seat_uuid}).exec();
        const menu_uuid = seat.menu_details[0].menu_uuid;

        // getting currency
        const outlet = await Outlet.findOne({outlet_uuid: "outlet-uuid-1"}).exec()
        const currency = outlet.setup.currency_sign

        const menu = await Menu.findOne({menu_uuid: menu_uuid}).exec();
        const category_and_items = menu.category_and_items;
        category_and_items.sort((a, b) => {
            return parseInt(a.menu_category_sort_order) - parseInt(b.menu_category_sort_order)
        })

        var category_menus = []
        for(var category_item of category_and_items) {
            var category_uuid = category_item.category_uuid
            const category = await Item_categories.findOne({category_uuid: category_uuid}).exec()

            var mitems = []
            var menu_items = category_item.menu_items;
            for (var menu_item of menu_items) {
                var item_uuid = menu_item.item_uuid;
                const item = await Item.findOne({item_uuid: item_uuid}).exec()

                var menu_item_addons = menu_item.menu_item_addons
                var addons = []
                for (var item_addon of menu_item_addons) {
                    var addon_item_details = item_addon.addon_item_details
                    var addon_details = []
                    for (var addon_detail of addon_item_details) {
                        var detail = {
                            item_uuid: addon_detail.item_uuid,
                            menu_item_addon_uuid: addon_detail.menu_item_addon_uuid,
                            price: addon_detail.price,
                            item_name: item.item_name
                        }
                        addon_details.push(detail)
                    }
                    var addon = {
                        addon_title: item_addon.addon_title,
                        addon_min: item_addon.addon_min,
                        addon_max: item_addon.addon_max,
                        addon_item_details: addon_details
                    }
                    addons.push(addon)
                }
                var mitem = {
                    item_uuid: item_uuid,
                    item_name: item.item_name,
                    item_mode: item.item_mode,
                    menu_item_uuid: menu_item.menu_item_uuid,
                    menu_item_description: menu_item.menu_item_description,
                    menu_item_status: menu_item.menu_item_status,
                    menu_item_price: menu_item.menu_item_price,
                    menu_item_discount: menu_item.menu_item_discount,
                    menu_item_label: menu_item.menu_item_label,
                    menu_item_addons: addons,
                    menu_item_multi: menu_item.menu_item_multi,
                }
                mitems.push(mitem)
            }

            var category_menu = {
                category_uuid: category_uuid,
                category_name: category.category_name,
                menu_items: mitems
            }
            category_menus.push(category_menu)
        }

        return res.status(200).json({category_menus: category_menus, currency: currency})
    } catch (err) {
        return res.status(500).json({category_menus: [], currency: "", err: err})
    }
})

module.exports = router;