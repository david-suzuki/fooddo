const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();
const Meal = require("../models/meals");
const Menu = require("../models/menus");
const Outlet = require("../models/outlets");
const Item = require("../models/items");
const Item_categories = require("../models/item_categories");

router.post("/list", async (req, res)=>{
    const body = req.body
    const outlet_uuid = body.outlet_uuid

    const meals = await Meal.find({outlet_uuid: outlet_uuid}).exec()
    meals.sort((a, b) => {
        return parseInt(a.sort_order) - parseInt(b.sort_order)
    })
    
    return res.status(200).json({meals: meals})
})

router.post("/getMenu", async (req, res)=>{
    try {
        const body = req.body
        const menu_type = body.menu_type
        const meal_uuid = body.meal_uuid
        const outlet_uuid = body.outlet_uuid
        const date = body.date

    //     var start_dates = date.split("/")
    //     var start_day = parseInt(start_dates[0])
    //     var start_month = parseInt(start_dates[1])
    //     var start_year = parseInt(start_dates[2])

    //     var start_date_obj = new Date(start_year, start_month-1, start_day)
    //     var end_date_obj = new Date(start_year, start_month-1, start_day);
    //     end_date_obj.setDate(end_date_obj.getDate() + 1)

        console.log("get menu.......")
        // getting currency
        const outlet = await Outlet.findOne({outlet_uuid: outlet_uuid}).exec()
        const currency = outlet.setup.currency_sign

        const menus = await Menu.find({meal_uuid: meal_uuid, outlet_uuid: outlet_uuid}).exec()

        var menu = null
        for (var m of menus) {
            if (m.menu_type.includes(menu_type)) {
                if (0< parseInt(m.date)-date && parseInt(m.date)-date < 86400000) {
                    menu = m;
                    break
                }
            }
        }

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

        console.log("got menu!")

        return res.status(200).json({category_menus: category_menus, currency: currency})
    } catch (err) {
        return res.status(500).json({category_menus: [], currency: "", err: err})
        // return res.status(500).json({category_menus: [], currency: ""})
    }
})

module.exports = router;

