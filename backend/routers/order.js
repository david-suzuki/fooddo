const express = require("express");
const { randomUUID } = require('crypto');
const checkauth = require("../middleware/auth")

const Order = require("../models/orders");
const Outlet = require("../models/outlets");
const Menu = require("../models/menus");
const Item = require("../models/items");

const router = express.Router();


router.post("/postorder", checkauth, (req, res, err) => {
    try {
        body = req.body
        body.map((value) => {
            Order(value).save()
                .then(result => {
                    if (result == null) { res.status(201).json({ message: "can not find" }) }
                    else { res.status(200).json({ message: "added" }) }
                })
                .catch(err => {
                    res.status(301).json({ messae: err })
                })
        })
    }
    catch {
        res.status(500).json({ "messaage": "internal server error", "error": err })
    }
})

// API= GetOrdersUUID/:Order_UUID
// Server Location = foodDo_DB.Order

//get order
router.post("/getOrder", checkauth, async (req, res) => {
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value) => {
        Order.findOne({ order_uuid: value.order_uuid }, (err, result) => {
            if (err) {
                temp.push("get error of finding" + value.order_uuid);
            }
            else {
                if (result == null) {
                    temp.push({ error: "order_uuid " + value.order_uuid + " is not define" })
                }
                else {
                    temp.push(result)
                }
            }
            i++;
            if (i === count) {
                res.status(200).json({ message_length: temp.length, result: temp })
            }
        });
    })
})

// get order date wise

router.post("/getOrderDate", checkauth, (req, res) => {

    body = req.body
    const count = body.length
    var i = 0;
    const temp = [];

    console.log(body);
    body.map((value) => {

        Order.find({ $and: [{ outlet_uuid: value.outlet_uuid }, { working_day: value.working_day }] }, (err, result) => {
            if (err) {
                temp.push("get error of finding" + value.working_day);
            }
            else {
                if (result == null || result === []) {
                    temp.push({ error: "working_day Date " + value.working_day + " is not define" })
                }
                else {
                    temp.push(result)
                }
            }
            i++;
            if (i === count) {
                res.status(200).json({ message_length: temp.length, result: temp })
            }
        });
    })
})



//put order
router.put("/putOrder", checkauth, (req, res, err) => {
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = [];
    body.map((value) => {

        Order.replaceOne({ order_uuid: value.order_uuid }, value, (err, result) => {
            i++;
            if (result.acknowledged == true) {
                if (result.matchedCount > 0) {
                    temp.push(value.order_uuid + " is updated")
                }
                else {
                    temp.push(value.order_uuid + " match is not founded")
                }
            } else {
                temp.push(value.order_uuid + " have some error")
            }
            console.log(result)
            if (i === count) {
                res.status(200).json({ message_length: temp.length, result: temp })
            }
        })
    })
})

//delete order
router.delete("/deleteOrder", checkauth, (req, res) => {
    body = req.body
    body.map((value) => {
        Order.deleteOne({ order_uuid: value.order_uuid }, (err, result) => {
            if (result.deletedCount == 0) {
                res.status(200).json({ message: 'not deleted any obj' })
            }
            else {
                res.status(200).json({ messgage: result.deletedCount + " items deleted" })
            }
        })
    })
})

router.post("/create", async (req, res) => {
    const body = req.body
    const outlet_uuid = body.outlet_uuid
    const menu_uuid = body.menu_uuid
    const brand_uuid = body.brand_uuid
    const items = body.items
    const payment_status = body.payment_status
    const order_type = body.order_type
    const grand_total = body.grand_total
    const seat_uuid = body.seat_uuid

    console.log("saving order....")
    // getting local_order_id
    const outlet = await Outlet.findOne({ outlet_uuid: outlet_uuid }).exec();
    const invoice_series = outlet.invoice_series
    const series = invoice_series.find(s => s.series_type === "S").series
    const next_order_number = invoice_series.find(s => s.series_type === "S").next_order_number
    const local_order_id = series + next_order_number
    // increasing the local_order_id
    invoice_series.find(s => s.series_type === "S").next_order_number = (parseInt(next_order_number) + 1).toString()

    // getting order_status
    const order_status = outlet.pickup_setup.default_order_status

    var db_items = await Item.find({}).exec();

    // getting item_total_price
    var total_price = 0
    var total_discount = 0
    var total_tax_gst = 0;
    var total_tax_vat = 0;
    var kot_items_details = []
    const menu = await Menu.findOne({ menu_uuid: menu_uuid }).exec()
    const category_items = menu.category_and_items
    items.map((item) => {
        category_items.map((citem) => {
            const menu_items = citem.menu_items;
            for (let mitem of menu_items) {
                var custom_price = 0
                if (mitem.item_uuid === item.item_uuid) {
                    var multi_details = []
                    // getting the price for menu_item_mutli
                    var item_serving = item.item_serving;
                    var menu_item_multi = mitem.menu_item_multi;
                    for (var item_multi of menu_item_multi) {
                        var multi_item_details = item_multi.multi_item_details;
                        for (var detail of multi_item_details) {
                            for (var serving of item_serving) {
                                if (detail.item_multi_name === serving.name) {
                                    custom_price += parseInt(detail.item_multi_price)
                                    var multi_detail = {
                                        item_multi_name: detail.item_multi_name,
                                        item_multi_price: detail.item_multi_price
                                    }
                                    multi_details.push(multi_detail)
                                }
                            }
                        }
                    }

                    var addon_details = []
                    // getting the price for menu_item_addon
                    var item_addons = item.item_addons;
                    var menu_item_addons = mitem.menu_item_addons;
                    for (var item_addon of menu_item_addons) {
                        var addon_item_details = item_addon.addon_item_details;
                        for (var detail of addon_item_details) {
                            for (var addon of item_addons) {
                                if (detail.item_uuid === addon.uuid) {
                                    custom_price += parseInt(detail.price)
                                    var addon_detail = {
                                        item_uuid: detail.item_uuid,
                                        price: detail.price
                                    }
                                    addon_details.push(addon_detail)
                                }
                            }
                        }
                    }

                    total_price += (parseInt(mitem.menu_item_price) + custom_price) * item.item_qty;
                    total_discount += (parseInt(mitem.menu_item_price) + custom_price) * (parseInt(mitem.menu_item_discount) / 100) * item.item_qty

                    var db_item = db_items.find(it => it.item_uuid === mitem.item_uuid);
                    var item_gst = db_item.outlet_wise_item_details[0].other_details.item_gst;
                    var item_vat = db_item.outlet_wise_item_details[0].other_details.item_vat;

                    total_tax_gst += (parseInt(mitem.menu_item_price) + custom_price) * (1 - parseInt(mitem.menu_item_discount) / 100) * (item_gst / 100) * item.item_qty;
                    total_tax_vat += (parseInt(mitem.menu_item_price) + custom_price) * (1 - parseInt(mitem.menu_item_discount) / 100) * (item_vat / 100) * item.item_qty;

                    // saving the data for kot
                    var kot_itemm_detail = {
                        item_uuid: mitem.item_uuid,
                        order_item_status: order_status,
                        order_item_qty: (item.item_qty).toString(),
                        order_item_unit_price: mitem.menu_item_price,
                        order_item_unit_discount: mitem.menu_item_discount,
                        order_item_unit_gst: ((parseInt(mitem.menu_item_price) + custom_price) * (1 - parseInt(mitem.menu_item_discount) / 100) * (item_gst / 100)).toString(),
                        order_item_unit_vat: ((parseInt(mitem.menu_item_price) + custom_price) * (1 - parseInt(mitem.menu_item_discount) / 100) * (item_vat / 100)).toString()
                    }

                    if (addon_details.length > 0) {
                        kot_itemm_detail.addon_details = addon_details
                    }

                    if (multi_details.length > 0) {
                        kot_itemm_detail.multi_details = multi_details
                    }

                    kot_items_details.push(kot_itemm_detail)
                }
            }
        })
    })

    var order_total = total_price - total_discount + total_tax_gst + total_tax_vat

    // KOT
    // getting kot number
    var kot = invoice_series.find(s => s.series_type === "S").next_kot_number
    invoice_series.find(s => s.series_type === "S").next_kot_number = (parseInt(kot) + 1).toString()

    await Outlet.findOneAndUpdate({ outlet_uuid: outlet_uuid }, { invoice_series: invoice_series });

    const current_date = Date.now();

    var order_data = {
        brand_uuid: brand_uuid,
        created_at: current_date,
        local_order_id: local_order_id,
        order_status: order_status,
        order_total: order_total.toString(),
        order_type: order_type.toString(),
        order_uuid: randomUUID(),
        outlet_uuid: outlet_uuid,
        seat_uuid: seat_uuid,
        payment_status: payment_status.toString(),
        preparation_status: "0",
        total_tax_gst: total_tax_gst.toString(),
        total_tax_vat: total_tax_vat.toString(),
        order_kot_details: [{
            kot: kot,
            created_at: current_date,
            kot_total: order_total.toString(),
            kot_status: order_status,
            kot_items_details: kot_items_details
        }]
    }

    Order(order_data).save()
        .then(result => {
            if (result == null) { res.status(201).json({ message: "can not find" }) }
            else { res.status(200).json({ message: "added" }) }
        })
        .catch(err => {
            res.status(301).json({ messae: err })
        })

    console.log("saving finished")
})

module.exports = router;





