const express = require("express");
const checkauth = require("../middleware/auth")

const router = express.Router();
const Menu = require("../models/menus");
const Outlet = require("../models/outlets");
const Item = require("../models/items");
const Seat = require("../models/seats");
const Item_categories = require("../models/item_categories");

router.post("/postMenu",checkauth, (req, res, err)=>{
    try{
        body = req.body
        body.map((value)=>{
            Menu(value).save()
            .then(result=>{
                res.status(200).json({message:"added"})
            })
            .catch(err=>{
                res.status(301).json({messae: err})
            })
        })
    }
    catch{
        res.status(500).json({"messaage":"internal server error", "error": err})
        console.log(err)
    }
})


//put menu
router.put("/putMenu", checkauth,(req, res)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
        Menu.replaceOne({menu_uuid: value.menu_uuid}, value, (err, result)=>{
            i++;
            if(result.acknowledged == true){
                if(result.matchedCount > 0){
                    temp.push(value.menu_uuid + " is updated")
                }
                else{
                    temp.push(value.menu_uuid + " match is not founded")
                }
            }else{
                temp.push(value.menu_uuid + " have some error")
            }
            console.log(result)
            if(i === count){
                res.status(200).json({message_length:temp.length, result: temp})
            }
        })
    })
})


router.delete("/deleteMenu", checkauth,(req, res)=>{
    body = req.body
    body.map((value)=>{
        Menu.find({outlet_uuid: "1"},(err, result)=>{
            if(result.length > 1){
                Menu.deleteOne({menu_uuid: "1"}, (err, result)=>{
                    res.status(200).json({message: "menu deleted"})
                })
            }else{
                res.status(401).json({message:"Cannot delete all menus from an outlet"})
            }
        })
    })
})

// router.post("/getMenu",checkauth, async(req, res)=>{
//     const body = req.body
//     const count = body.length
//     var i = 0;
//     const temp = []
//     await body.map((value)=> {
//         Menu.findOne({ menu_uuid: value.menu_uuid }, (err, result)=>{
//             if(err){
//                 temp.push("get error of finding" + value.menu_uuid);
//             }
//             else{
//                 if(result == null){
//                     temp.push({error: "menu_uuid "+value.menu_uuid + " is not define"})
//                 }
//                 else{
//                     temp.push(result)
//                 }
//             }
//             i++;
//             if(i === count){
//                 res.status(200).json({message_length:temp.length, result: temp})
//             }
//         });       
//     })
// })

router.post("/getMenu", async (req, res)=>{
    try {
        const body = req.body
        const menu_type = body.menu_type
        const menu_for = body.menu_for

        var menu_uuid = ""
        const menus = await Menu.find({}).exec()
        for (var m of menus) {
            menu_type_arr = m.menu_type;
            menu_for_arr = m.menu_for;
            if (menu_type_arr.includes(menu_type) && menu_for_arr.includes(menu_for)) {
                menu_uuid = m.menu_uuid
                break
            }
        }

        // const menu_uuid = req.menu_uuid;
        console.log("get menu.......", menu_uuid)
        // getting currency
        const outlet = await Outlet.findOne({outlet_uuid: "outlet-uuid-1"}).exec()
        const currency = outlet.setup.currency_sign

        const menu = await Menu.findOne({menu_uuid: "menu-uuid-1"}).exec();
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
    }
})

router.post("/list", (req, res)=>{
    const body = req.body
    const outlet_uuid = body.outlet_uuid
    const menu_uuid = body.menu_uuid
    Menu.find({outlet_uuid: outlet_uuid, menu_uuid: menu_uuid}, function(err, data){
        if (err) throw err;
        category_items = data[0].category_and_items
        category_items.sort((a, b) => {
            return parseInt(a.menu_category_sort_order) - parseInt(b.menu_category_sort_order)
        })
        // for (var category_item of category_items) {
        //     for (var menu_item of category_item.menu_items) {
        //         var item_uuid = menu_item.item_uuid
        //         Item.find({item_uuid: item_uuid}, (err, data)=>{
        //             console.log(data)
        //             menu_item.item_name = data[0].item_name
        //         })
        //     }
        // }
        res.json(category_items)
    });
})

router.post("/getOne", (req, res)=>{
    const body = req.body
    const outlet_uuid = body.outlet_uuid
    const menu_uuid = body.menu_uuid
    Menu.find({outlet_uuid: outlet_uuid, menu_uuid: menu_uuid}, function(err, data){
        if (err) throw err;
        res.json(data[0])
    });
})

router.post("/getMenuUUID", async (req, res)=>{
    const body = req.body
    const menu_type = body.menu_type
    const menu_for = body.menu_for
    console.log("getting menu uuid.....")
    const menus = await Menu.find({}).exec()
    menus.map((menu) => {
        menu_type_arr = menu.menu_type;
        menu_for_arr = menu.menu_for;
        if (menu_type_arr.includes(menu_type) && menu_for_arr.includes(menu_for)) {
            res.json({menu_uuid: menu.menu_uuid})
        }
    })
    res.json({"msg":"no found"})
})

module.exports = router;

