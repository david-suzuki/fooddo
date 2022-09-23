import { Fragment, useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import SmallNav from "../components/SmallNav"
import { useCartContext, payloadType, multiAddonType, multiServingType } from "../contexts/CartProvider"
import { localServerUrl, remoteServerUrl } from "../contexts/Constants";
import { itemType } from "../types";
import axios from "axios";
import MoreIcon from "../components/MoreIcon";
import AddressDropdownMenu from "../components/AddressDropdownMenu";
import ConfirmModal from "../components/ConfirmModal";

export default function CartPage(props:{seatUUid: string, showAddress: boolean}) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [countTotal, setCountTotal] = useState<number>(0);
    const [isChooseAddressOpen, setIsChooseAddressOpen] = useState<boolean>(false)
    const [newAddressOpen, setNewAddressOpen] = useState<boolean>(false)
    const [items, setItems] = useState<Array<itemType>>([])
    const [currency, setCurrency] = useState<string>("")
    const [taxes, setTaxes] = useState<number>(0)

    const [deliveryCharges, setDeliveryCharges] = useState<string>("")
    const [deliveryChargeCondition, setDeliveryChargeCondition] = useState<string>("")
    const [deliveryChargeBillAmount, setDeliveryChargeBillAmount] = useState<string>("")

    const [brandUuid, setBrandUudid] = useState<string>("")
    const [defaultCustomerAddress, setDefaultCustomerAddress] = useState<string>("")
    const [addresses, setAddresses] = useState<Array<string>>([])

    const [addressLine1, setAddressLine1] = useState<string>("")
    const [addressLine2, setAddressLine2] = useState<string>("")
    const [addressLine3, setAddressLine3] = useState<string>("")
    const [isEmptyAddressLines, setIsEmptyAddressLines] = useState<boolean>(false)
    const [addressIndex, setAddressIndex] = useState<number>(-1)
    const [isDeleteAddress, setIsDeleteAddress] = useState<boolean>(false)

    const { state, dispatch } = useCartContext()
    const menu_data = { outlet_uuid: 'outlet-uuid-1', menu_uuid: 'menu-uuid-1' };
    
    const customer_mobile = "9876543210"

    const item_total_board = state.reduce((p, c) => p + (parseFloat(c.menu_item_price) + c.customizable_price) * c.quantity, 0);
    const discount_board = state.reduce((p, c) => p + (parseFloat(c.menu_item_price) + c.customizable_price) * (parseFloat(c.menu_item_discount) / 100) * c.quantity, 0)

    const navigate = useNavigate()

    useEffect(() => {
        // setCountTotal(cartItems.reduce((r, c) => c.price * c.quantity + r, 0))
        axios.get(remoteServerUrl + "item/list")
            .then((response) => {
                var taxes = 0;
                var items = response.data
                items.map((item: itemType, i: number) => {
                    state.map((data, j) => {
                        if (item.item_uuid == data.item_uuid) {
                            var item_gst = item.outlet_wise_item_details[0].other_details !== undefined ? item.outlet_wise_item_details[0].other_details.item_gst : "0";
                            var item_vat = item.outlet_wise_item_details[0].other_details !== undefined ? item.outlet_wise_item_details[0].other_details.item_vat : "0";
                            taxes += (parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * (parseFloat(item_gst)/100 + parseFloat(item_vat)/100) * data.quantity;
                        }
                    })
                })
                setItems(items)
                setTaxes(Math.round((taxes + Number.EPSILON) * 100) / 100)
            }).catch((err) => {
                console.log(err);
            });
        axios.get(remoteServerUrl + "outlet/detail")
            .then((response) => {
                console.log(response.data)
                setCurrency(response.data.setup.currency_sign);
                // calculating delivery charge
                if (props.showAddress) {
                    const delivery_charge_condition = response.data.delivery_setup.delivery_charge_condition;
                    setDeliveryChargeCondition(delivery_charge_condition)
                    const delivery_charges = response.data.delivery_setup.delivery_charges;
                    setDeliveryCharges(delivery_charges)
                    const delivery_charge_bill_amount = response.data.delivery_setup.delivery_charge_bill_amount;
                    setDeliveryChargeBillAmount(delivery_charge_bill_amount)
                }
            }).catch((err) => {
                console.log(err);
            });

        axios.post(remoteServerUrl + "menu/getOne", menu_data)
            .then((response) => {
                var menu = response.data
                setBrandUudid(menu.brand_uuid)
            }).catch((err) => {
                console.log(err);
            });
        if (props.showAddress) {
            // getting default address
            axios.post(remoteServerUrl + "customer/getAddress", {customer_mobile: customer_mobile})
                .then((response) => {
                    setDefaultCustomerAddress(response.data.default_address)
                    setAddresses(response.data.addresses)
                }).catch((err) => {
                    console.log(err);
                });
        }
    }, [])

    const cartCountMinusHandler = (event: React.MouseEvent<HTMLElement>, data: payloadType) => {
        var payloadData = {
            menu_item_price: "",
            menu_item_discount: "",
            customizable_price: 0,
            item_uuid: data.item_uuid,
            quantity: data.quantity - 1,
            multis: [],
            addons: []
        }
        if (data.quantity - 1 > 0)
            dispatch({type: 'changeItemQuantity', payload:payloadData})
        else
            dispatch({type: 'removeItemQuantity', payload:payloadData})

        var newTaxes = 0;
        items.map((item)=>{
            if (item.item_uuid===data.item_uuid) {
                var item_gst = item.outlet_wise_item_details[0].other_details !== undefined ? 
                                item.outlet_wise_item_details[0].other_details.item_gst : "0";
                var item_vat = item.outlet_wise_item_details[0].other_details !== undefined ? 
                                item.outlet_wise_item_details[0].other_details.item_vat : "0";
                var old_data_taxe = (parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * (parseFloat(item_gst)/100 + parseFloat(item_vat)/100) * data.quantity;
                var new_data_taxe = (parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * (parseFloat(item_gst)/100 + parseFloat(item_vat)/100) * (data.quantity - 1);
                newTaxes = taxes - old_data_taxe + new_data_taxe;
            }
        })
        setTaxes(Math.round((newTaxes + Number.EPSILON) * 100) / 100)
    }

    const cartCountPlusHandler = (event: React.MouseEvent<HTMLElement>, data: payloadType) => {
        var payloadData = {
            menu_item_price: "",
            menu_item_discount: "",
            customizable_price: 0,
            item_uuid: data.item_uuid,
            quantity: data.quantity + 1,
            multis: [],
            addons: []
        }
        dispatch({type: 'changeItemQuantity', payload:payloadData})

        var newTaxes = 0;
        items.map((item)=>{
            if (item.item_uuid===data.item_uuid) {
                var item_gst = item.outlet_wise_item_details[0].other_details !== undefined ? 
                                item.outlet_wise_item_details[0].other_details.item_gst : "0";
                var item_vat = item.outlet_wise_item_details[0].other_details !== undefined ? 
                                item.outlet_wise_item_details[0].other_details.item_vat : "0";
                var old_data_taxe = (parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * (parseFloat(item_gst)/100 + parseFloat(item_vat)/100) * data.quantity;
                var new_data_taxe = (parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * (parseFloat(item_gst)/100 + parseFloat(item_vat)/100) * (data.quantity + 1);
                newTaxes = taxes - old_data_taxe + new_data_taxe;
            }
        })
        setTaxes(Math.round((newTaxes + Number.EPSILON) * 100) / 100)
    }

    const sendOrderHandler = (event: React.MouseEvent<HTMLElement>) => {
        type itemArrayType = {
            item_uuid: string,
            item_qty: number,
            item_serving: Array<multiServingType>,
            item_addons: Array<multiAddonType>
        }

        var item_array:Array<itemArrayType> = []

        state.map((item)=>{
            var itemm_obj = {
                item_uuid: item.item_uuid,
                item_qty: item.quantity,
                item_serving: item.multis,
                item_addons: item.addons
            }
            item_array.push(itemm_obj)
        })
        const order_data = { 
            outlet_uuid: 'outlet-uuid-1', 
            menu_uuid: 'menu-uuid-1',
            brand_uuid: brandUuid,
            seat_uuid: props.seatUUid,
            items: item_array,
            payment_status: 0,
            order_type: props.seatUUid === "" ? 1 : 0,
            grand_total: Math.round(item_total_board - discount_board + taxes)
        };

        axios.post(remoteServerUrl + "order/create", order_data)
            .then((response) => {
                
            }).catch((err) => {
                console.log(err);
            });
        navigate('/');
    }

    const selectAddressHandler = (event: React.MouseEvent<HTMLElement>, address:string) => {
        setDefaultCustomerAddress(address)
        setIsChooseAddressOpen(false)
        var data = {
            customer_mobile: customer_mobile,
            address: address
        }
        axios.post(remoteServerUrl + "customer/setDefaultAddress", data)
            .then((response) => {
                console.log(response)
            }).catch((err) => {
                console.log(err);
            });
    }

    const saveAddressHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (addressLine1 === "" || addressLine2 === "" || addressLine3 === "") {
            setIsEmptyAddressLines(true)
            return
        }

        setNewAddressOpen(false)

        var address = addressLine1 + "\n" + addressLine2 + "\n" + addressLine3;
        var data = {
            customer_mobile: customer_mobile,
            address: address,
            index: addressIndex
        }

        setIsChooseAddressOpen(true)

        if (addressIndex < 0) {
            setAddresses([...addresses, address])
            axios.post(remoteServerUrl + "customer/createAddress", data)
            .then((response) => {
                console.log(response.data)
            }).catch((err) => {
                console.log(err);
            });
        } else {
            setAddresses(addresses.map((addr, i) => {
                if (i === addressIndex) {
                    return address
                }
                return addr
            }))
            axios.post(remoteServerUrl + "customer/updateAddress", data)
            .then((response) => {
                console.log(response.data)
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    const editAddressHandler = (index: number) => {
        setNewAddressOpen(true);
        setIsChooseAddressOpen(false);
        
        var address = addresses[index]
        var address_arr = address.split("\n");
        
        setAddressLine1(address_arr[0])
        setAddressLine2(address_arr[1])
        setAddressLine3(address_arr[2])
        setAddressIndex(index)
    }

    const addAddressHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("sdfsfsdf")
        setIsChooseAddressOpen(false); 
        setNewAddressOpen(true)
        setAddressLine1("")
        setAddressLine2("")
        setAddressLine3("")
        setAddressIndex(-1)
    }

    const deleteAddressHandler = (index: number) => {
        setIsDeleteAddress(true)
        setAddressIndex(index)
    }

    const removeAddressResult = (result: string) => {
        setIsDeleteAddress(false)
        if (result === "ok") {
            setAddresses(addresses.filter((address, i) => i !== addressIndex))
            var data = {
                customer_mobile: customer_mobile,
                index: addressIndex
            }
            axios.post(remoteServerUrl + "customer/deleteAddress", data)
            .then((response) => {
                console.log(response.data)
            }).catch((err) => {
                console.log(err);
            });
        }
        setAddressIndex(-1)
    }

    const containerClass = props.showAddress ? "cartContainer1" : "cartContainer"
    return (
        <div className={containerClass}>
            <SmallNav needSearchBar={false} to="" headline="Domin's" />
            <h1 className="cartHeading">Your Cart <i className="fas fa-shopping-bag"></i></h1>
            <div className="cart">
                {state.map((data, i) =>
                    <div className="cartItems" key={i}>
                        <div className="cartOptions">
                            <div className="cartNameVeg">
                                {
                                    items.find((item)=>item.item_uuid===data.item_uuid)?.item_mode &&
                                    items.find((item)=>item.item_uuid===data.item_uuid)?.item_mode == "1" ?
                                    <img src="avilable.png" alt="veg" /> :
                                    <img src="notAvilable.png" alt="not_veg" />

                                }
                            </div>
                            <div className="cartdetails">
                                <h1>{items.find((item)=>item.item_uuid === data.item_uuid)?.item_name}</h1>
                                <h3>{currency} {data.menu_item_price}</h3>
                                {
                                    data.multis.map((multi, i)=>
                                        <span key={i} style={{fontSize: '14px'}}>-{multi.name} {currency}{multi.price}</span>
                                    )
                                }
                                {
                                    data.addons.map((addon, i)=>
                                        <span key={i} style={{fontSize: '14px'}}>+{addon.name} {currency}{addon.price}</span>
                                    )
                                }
                            </div>
                        </div>
                        <div className="cartFunction">
                            <button>
                                {
                                    <i className="fas fa-minus" onClick={(e)=>cartCountMinusHandler(e, data)}></i> 
                                }
                                {data.quantity} 
                                <i className="fas fa-plus" onClick={(e)=>cartCountPlusHandler(e, data)}></i>
                            </button>
                            <h3>{currency}{(parseFloat(data.menu_item_price) + data.customizable_price) * (1-parseFloat(data.menu_item_discount)/100) * data.quantity}</h3>
                        </div>
                    </div>
                )}
                <div className="totalBox">
                    <div className="totalItem">
                        <span style={{width: '60%'}}>Item Total</span>
                        <span>:</span>
                        <span style={{width: '30%'}}>{currency} {item_total_board}</span>
                    </div>
                    <div className="totalItem" style={{color:"red"}}>
                        <span style={{width: '60%'}}>Discount</span>
                        <span>:</span>
                        <span style={{width: '30%'}}>{currency} {discount_board}</span>
                    </div>
                    <div className="totalItem">
                        <span style={{width: '60%'}}>Taxes</span>
                        <span>:</span>
                        <span style={{width: '30%'}}>{currency} {taxes}</span>
                    </div>
                    {
                    props.showAddress &&     
                    <div className="totalItem">
                        <span style={{width: '60%'}}>Delivery Charge</span>
                        <span>:</span>
                        <span style={{width: '30%'}}>{currency} {
                            deliveryChargeCondition === "1" ? deliveryCharges :
                                deliveryChargeCondition === "0" ? "0" :
                                    item_total_board - discount_board + taxes >= parseFloat(deliveryChargeBillAmount) ? "0" : deliveryCharges
                        }
                        </span>
                    </div>
                    }
                    <div className="totalItem" style={{color:"black", fontWeight:'bold'}}>
                        <span style={{width: '60%'}}>Grand Total</span>
                        <span>:</span>
                        <span style={{width: '30%'}}>{currency} {Math.round(item_total_board - discount_board + taxes)}
                        </span>
                    </div>
                </div>                  
            </div>
            { props.showAddress &&
            <Fragment>
                <div className="more">
                    <button onClick={() => setIsModalOpen(!isModalOpen)} className="moreBtn">
                        <MoreIcon />
                    </button>
                    <p onClick={() => setIsModalOpen(!isModalOpen)}>Do You want to add cooking instructions ?</p>
                </div>
                <div className="addressBar">
                    <div className="address">
                        <div className="addressbook">
                            <img src="location.png" alt="location" />
                            <h1>Delivery at <span>a - {defaultCustomerAddress}</span></h1>
                        </div>
                        <button onClick={() => setIsChooseAddressOpen(!isChooseAddressOpen)}>Change</button>
                    </div>
                </div>
            </Fragment>
            }
            <div className="paymentBox">
                <div className="paymentInfo">
                    <div className="paytmlogo">
                        <img src="paytm.png" alt="paytm" />
                        <h3>Pay Using <i className="fas fa-caret-up"></i></h3>
                    </div>
                    <h4>Paytm UPI</h4>
                </div>
                <button>
                    <span className="paymentInbtn">
                        <span>{currency} {Math.round(state.reduce((p, c) => p + (parseFloat(c.menu_item_price) + c.customizable_price) * c.quantity, 0)
                                                            -state.reduce((p, c) => p + (parseFloat(c.menu_item_price) + c.customizable_price) * (parseFloat(c.menu_item_discount) / 100) * c.quantity, 0)
                                                            +taxes)}
                        </span>
                        <span>Total</span>
                    </span> 
                    <span onClick={sendOrderHandler}>Place Order <i className="fas fa-caret-right"></i></span>
                </button>
            </div>
            {
                isModalOpen &&
                <div className="modal">
                    <div className="insideModal">
                        <i className="fas fa-times" onClick={() => setIsModalOpen(false)}></i>
                        <h2>Special cooking instructions</h2>
                        <h3>Start typing...</h3>
                        <input type="text" />
                        <button>Add</button>
                    </div>
                </div>
            }
            <div className={`${isChooseAddressOpen ? 'opendAddr' : ""} chooseAddress`}>
                <div className={`${isChooseAddressOpen ? 'opendAddr' : ""} chooseBox`}>
                    <button onClick={() => setIsChooseAddressOpen(false)} className="fas fa-times closeAdd"></button>
                    <div className="choosebar">
                        <h1>Select an address</h1>
                        <button onClick={addAddressHandler} className="addAddress">
                            + Add Address
                        </button>
                        <h2>Delivery to</h2>
                        <div className="addressList">
                        {addresses.map((address, i)=>
                            <div className="delAddt" key={i} onClick={(e) => selectAddressHandler(e, address)}>
                                <img src="location.png" alt="alt" />
                                <div className="addrDetails">
                                    <div className="detaDelAddr">
                                        <h3>a</h3>
                                        {
                                            address.split("\n").map((addr, i)=>
                                                <h5 key={i}>{addr.substring(0, 100)}</h5>        
                                            )
                                        }
                                    </div>
                                    <AddressDropdownMenu 
                                        onEditAddress={() => editAddressHandler(i) }
                                        onDeleteAddress={() => deleteAddressHandler(i)}
                                        index={i}
                                    />
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${newAddressOpen ? 'opendAddr' : ""} chooseAddress`}>
                <div className={`${newAddressOpen ? 'opendAddr' : ""} chooseBox`}>
                    <button onClick={() => setNewAddressOpen(false)} className="fas fa-times closeAdd"></button>
                    <div className="addnewAddress">
                        <h1>Enter address details</h1>
                        <input 
                            type="text" 
                            placeholder="Address Line 1" 
                            onChange={e=>setAddressLine1(e.target.value)}
                            value={addressLine1}/>
                        <input 
                            type="text" 
                            placeholder="Address Line 2"
                            onChange={e=>setAddressLine2(e.target.value)}
                            value={addressLine2} />
                        <input 
                            type="text" 
                            placeholder="Address Line 3" 
                            onChange={e=>setAddressLine3(e.target.value)}
                            value={addressLine3}/>
                        {
                            isEmptyAddressLines && 
                            <span style={{color:'red', fontSize:'14px'}}>Fill all of address lines, please.</span>
                        }
                        <button onClick={saveAddressHandler}>Save Address</button>
                    </div>
                </div>
            </div>
            {
                isDeleteAddress && 
                <ConfirmModal 
                    onResult={removeAddressResult}
                />
            }
        </div>
    )
}