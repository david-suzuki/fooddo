const mongoose = require("mongoose");

const Order = mongoose.Schema({
    charges_and_discounts: [{
        type: { type: String },
        percent: { type: String },
        amt: { type: String },
        title: { type: String },
        remarks: { type: String }
    }],
    comments: [{
        user_uuid: { type: String },
        comment_date: { type: String },
        comment_time: { type: String },
        comment: { type: String }
    }],
    logs: [],
    brand_uuid: { type: String },
    completed_at: { type: Date },
    created_at: { type: Date },
    Timestamp: { type: Date },
    created_by_user_uuid: { type: String },
    customer_mobile: { type: String },
    customer_name: { type: String },
    delivery_status: { type: String },
    fin_uuid: { type: String },
    last_updated_at: { type: Date },
    local_order_id: { type: String },
    order_status: { type: String },
    order_total: { type: String },
    order_type: { type: String },
    order_uuid: { type: String },
    outlet_uuid: { type: String },
    payment_at: { type: Date },
    payment_by_user_uuid: { type: String },
    payment_status: { type: String },
    payment_total: { type: String },
    preparation_status: { type: String },
    seat_uuid: { type: String },
    taxation_type: { type: String },
    total_tax_cess: { type: String },
    total_tax_gst: { type: String },
    total_tax_vat: { type: String },
    working_day: { type: String },
    payment_details: [{
        payment_mode_uuid: { type: String },
        amount: { type: String }
    }],

    order_kot_details: [{
        kot: { type: String },
        user_uuid: { type: String },
        creation_date: { type: Date },
        created_at: { type: Date },
        kot_items_details: [
            {
                item_uuid: { type: String },
                order_item_status: { type: String },
                order_item_qty: { type: String },
                order_item_instruction: { type: String },
                order_item_amount_inclusive_taxes: { type: String },
                order_item_taxable_value: { type: String },
                order_item_unit_price: { type: String },
                order_item_unit_gst: { type: String },
                order_item_unit_vat: { type: String },
                order_item_unit_cess: { type: String },
                order_item_unit_discount: { type: String },
                parcel: { type: String },
                addon_details: [{
                    item_uuid: { type: String },
                    price: { type: String }
                },],
                multi_details: [{
                    name: { type: String },
                    price: { type: String }
                },],
            },
        ],
        kot_gst: { type: String },
        kot_vat: { type: String },
        kot_total: { type: String },
    }]
})


module.exports = mongoose.model("order", Order)