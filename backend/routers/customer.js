const express = require("express");
const checkauth = require("../middleware/auth")

const Customer = require("../models/customer");

const router = express.Router();


//get customer
router.post("/getCustomer",checkauth, async(req, res)=>{
    const body = req.body
    const count = body.length
    var i = 0;
    const temp = []
    await body.map((value)=> {
        Customer.findOne({customer_mobile: value.customer_mobile}, (err, result)=>{
            if(err){
                temp.push("get error of finding" + value.customer_mobile);
            }
            else{
                if(result == null){
                    temp.push({error: "customer_mobile "+value.customer_mobile + " is not define"})
                }
                else{
                    var new_outlet = result['outlet_wise_customer_details'].filter(ele => ele.outlet_uuid === value.outlet_uuid )
                    console.log(new_outlet)
                    result.outlet_wise_customer_details = new_outlet
                    temp.push(result);
                }
            }
            i++;
            if(i === count){
                res.status(200).json({message_length :temp.length, result: temp})
            }
        })
    })
})



// API= PostBrand
// Server Location = foodDo_DB.Brand

router.post("/postCustomer",checkauth, (req, res)=>{
    try{
        body = req.body
        body.map((value)=>{
            Customer(value).save()
            .then(result=>{
                res.status(200).json({message:"added"})
            })
            .catch(err=>{
                res.status(err).json({messae: err})
            })
        })
    }
    catch{
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
})

//put customer
router.put("/putCustomer",checkauth, (req, res)=>{
    const body = req.body
    var temp = []
    const count = body.length
    var i = 0;
    body.map((value)=>{
    var outlet =  value.outlet_wise_customer_details;
    Customer.updateOne({customer_mobile: value.customer_mobile}, value, value, (err, result)=>{
        i++;
        if(result.acknowledged == true){
            if(result.matchedCount > 0){
                temp.push(value.customer_mobile + " is updated")
            }
            else{
                temp.push(value.customer_mobile + " match is not founded")
            }
        }else{
            temp.push(value.customer_mobile + " have some error")
        }
        console.log(result)
        if(i === count){
            res.status(200).json({message_length:temp.length, result: temp})
        }
    })
})
})

router.post("/getAddress", async (req, res)=>{
    try{ 
        const body = req.body
        const mobile = body.customer_mobile;
        const customer = await Customer.findOne({customer_mobile: mobile}).exec()

        const customer_self_addresses = customer.customer_self_address;

        const default_address_obj = customer_self_addresses.find((address)=>address.default==="y")
        var default_address = ""
        
        if (default_address_obj !== undefined)
            default_address = default_address_obj.address

        var addresses = [default_address]
        for (var address of customer_self_addresses) {
            if (address.default === "n") {
                addresses.push(address.address)
            }
        }
        res.status(200).json({"default_address":default_address, "addresses":addresses})
    } catch (err){
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
    
})

router.post("/setDefaultAddress", async (req, res)=>{
    try{ 
        const body = req.body
        const mobile = body.customer_mobile;
        const default_address = body.address;
        const customer = await Customer.findOne({customer_mobile: mobile}).exec()
        const customer_self_addresses = customer.customer_self_address;
        var addresses = []
        for (var customer_address of customer_self_addresses) {
            var address = {
                lat: customer_address.lat,
                long: customer_address.long,
                address: customer_address.address 
            }

            if (customer_address.address === default_address) 
                address.default = "y"
            else
                address.default = "n"

            addresses.push(address)   
        }

        await Customer.findOneAndUpdate({customer_mobile: mobile}, {customer_self_address: addresses});

        res.status(200).json({"messaage":"default address changed successfully"})
    } catch (err){
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
    
})

router.post("/createAddress", async (req, res)=>{
    try{ 
        const body = req.body
        const mobile = body.customer_mobile;
        const address = body.address;
        const customer = await Customer.findOne({customer_mobile: mobile}).exec()

        var customer_self_address = {
            lat: "",
            long: "",
            address: address,
            default: "n"
        }
        const customer_self_addresses = [...customer.customer_self_address, customer_self_address];

        await Customer.findOneAndUpdate({customer_mobile: mobile}, {customer_self_address: customer_self_addresses});

        res.status(200).json({"messaage":"address added successfully"})
    } catch (err){
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
    
})

router.post("/updateAddress", async (req, res)=>{
    try{ 
        const body = req.body
        const mobile = body.customer_mobile;
        const address = body.address;
        const index = body.index
        const customer = await Customer.findOne({customer_mobile: mobile}).exec()

        var customer_self_address = {
            lat: "",
            long: "",
            address: address,
            default: "n"
        }
        var customer_self_addresses = customer.customer_self_address;
        customer_self_addresses[index] = customer_self_address

        await Customer.findOneAndUpdate({customer_mobile: mobile}, {customer_self_address: customer_self_addresses});

        res.status(200).json({"messaage":"address updated successfully"})
    } catch (err){
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
    
})

router.post("/deleteAddress", async (req, res)=>{
    try{ 
        const body = req.body
        const mobile = body.customer_mobile;
        const index = body.index
        const customer = await Customer.findOne({customer_mobile: mobile}).exec()

        var customer_self_addresses = customer.customer_self_address;
        var customer_addresses = customer_self_addresses.filter((address, i)=>i !== index)

        await Customer.findOneAndUpdate({customer_mobile: mobile}, {customer_self_address: customer_addresses});

        res.status(200).json({"messaage":"address deleted successfully"})
    } catch (err){
        res.status(500).json({"messaage":"internal server error", "error": err})
    }
    
})

module.exports = router;