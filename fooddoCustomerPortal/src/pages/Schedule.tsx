import { useEffect, useState, Fragment } from "react";
import { categoryMenuType, menuItemType, mealType } from "../types";
import { useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll'
import axios from "axios";
import { useCartContext, multiAddonType, multiServingType } from "../contexts/CartProvider"
import { localServerUrl, remoteServerUrl } from "../contexts/Constants";

export default function Schedule(props: {date: Date}) {
    const [categoryMenus, setCategoryMenus] = useState<Array<categoryMenuType>>([])
    const [currency, setCurrency] = useState<string>("")
    const [meals, setMeals] = useState<Array<mealType>>([])
    const [activeMeal, setActiveMeal] = useState<string>("")
    const [isCustomMenuOpen, setIsCustomMenuOpen] = useState<boolean>(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false)
    const [customItem, setCustomItem] = useState<menuItemType|null>(null)
    const [customizableOrderCount, setCustomizableOrderCount] = useState<number>(1)
    const [clickedId, setClickedId] = useState('0')
    const [customizablePrice, setCustomizablePrice] = useState<number>(0)
    const [multiRowArr, setMultiRowArr] = useState<Array<number>>([])
    const [addonRowArr, setAddonRowArr] = useState<Array<number>>([])
    const [multiErrorArr, setMultiErrorArr] = useState<Array<number>>([])
    const [addonErrorArr, setAddonErrorArr] = useState<Array<number>>([])
    const [multis, setMultis] = useState<Array<multiServingType>>([])
    const [addons, setAddons] = useState<Array<multiAddonType>>([])

    const navigate = useNavigate();

    useEffect(() => {
        axios.post(remoteServerUrl + "meal/list", {outlet_uuid:"outlet-uuid-1"})
        .then((response) => {
            setMeals(response.data.meals)
            response.data.meals[0] && setActiveMeal(response.data.meals[0].meal_uuid)
        }).catch((err) => {
            console.log(err);
        });
    }, [])
    
    useEffect(() => {
        const gmt_date = props.date.toUTCString().replace(/[0-9]+:[0-9]+:[0-9]+/, "00:00:00")
        var gmtdate = new Date(gmt_date).getTime();
        var data = {
            menu_type: "5",
            meal_uuid: activeMeal,
            outlet_uuid: "outlet-uuid-1",
            date: gmtdate
        }
        axios.post(remoteServerUrl + "meal/getMenu", data)
        .then((response) => {
            setCategoryMenus(response.data.category_menus)
            setCurrency(response.data.currency)
        }).catch((err) => {
            setCategoryMenus([])
        });
    }, [activeMeal, props.date])

    const { state, dispatch } = useCartContext();

    const addCustomizableItemHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        // validation for menu_item_multi
        const multiErrors:Array<number> = []
        const item_multis = customItem?.menu_item_multi;
        item_multis?.map((multi, i) => {
            var count = 0
            multiRowArr.map((ele) => {
                if (i === ele) 
                    count++
            })

            if (count < 1 || 1 < count) 
                multiErrors.push(i)
        })
        setMultiErrorArr(multiErrors);
        
        // validation for menu_item_addon
        const addonErrors:Array<number> = []
        const item_addons = customItem?.menu_item_addons;
        item_addons?.map((addon, i) => {
            var count = 0
            addonRowArr.map((ele) => {
                if (i === ele) 
                    count++
            })
            var minimum = parseInt(addon.addon_min);
            var maximum = parseInt(addon.addon_max);

            if (count < minimum || maximum < count) 
                addonErrors.push(i)
        })
        setAddonErrorArr(addonErrors)

        if (multiErrors.length > 0 || addonErrors.length > 0) 
            return

        // const button: HTMLButtonElement = event.currentTarget;
        setIsCustomMenuOpen(false);
        
        if (customItem !== null)
            addToCart(customItem, multis, addons)

        initCustomizableItem();
    };

    // the type defnition for each row of customizable item
    type customizableItemType = {
        customizable_item_type: string,
        customizable_index: number
    }

    // This function will be triggered when a checkbox changes its state
    const selectPrice = (event: React.ChangeEvent<HTMLInputElement>, param: customizableItemType) => {
        var itemType = param.customizable_item_type;
        var idx = param.customizable_index;
        // name of multi_serving or multi_addon
        var selectedName = event.target.name;

        const selectedPrice = parseFloat(event.target.value);
        const checked = event.target.checked;
        if (checked) {
            setCustomizablePrice(customizablePrice + selectedPrice)
            // making array for validation, adding checked element
            if (itemType == 'serving') {
                const newArr = [...multiRowArr];
                newArr.push(idx);
                setMultiRowArr(newArr)
                setMultis([...multis, {name: selectedName, price: selectedPrice}])
            } else if (itemType == 'addon') {
                const newArr = [...addonRowArr];
                newArr.push(idx);
                setAddonRowArr(newArr)
                var selectedUuid = event.target.id;
                setAddons([...addons, {uuid: selectedUuid, name: selectedName, price: selectedPrice}])
            }
        } else {
            setCustomizablePrice(customizablePrice - selectedPrice)
            // making array for validation, removing unchecked element
            if (itemType == 'serving') {
                const index = multiRowArr.indexOf(idx);
                const newArr = [...multiRowArr];
                newArr.splice(index, 1)
                setMultiRowArr(newArr)
                setMultis(multis.filter(multi=>multi.name !== selectedName))
            } else if (itemType == 'addon') {
                const index = addonRowArr.indexOf(idx);
                const newArr = [...addonRowArr];
                newArr.splice(index, 1);
                setAddonRowArr(newArr)
                var selectedUuid = event.target.id;
                setAddons(addons.filter(addon=>addon.uuid !== selectedUuid))
            }
        }
    };

    const cartAmountIncreaseHandler = (event: React.MouseEvent<HTMLElement>, data:menuItemType) => {
        var q = state.find(s=>s.item_uuid===data.item_uuid)?.quantity;
        var quantity:number = q !== undefined ? q+1 : 0
        var payloadData = {
            menu_item_price: "",
            menu_item_discount: "",
            customizable_price: 0,
            item_uuid: data.item_uuid,
            quantity: quantity,
            multis: [],
            addons: []
        }
        dispatch({type: 'changeItemQuantity', payload:payloadData})
    }

    const cartAmountDecreaseHandler = (event: React.MouseEvent<HTMLElement>, data:menuItemType) => {
        var q = state.find(s=>s.item_uuid===data.item_uuid)?.quantity;
        var quantity:number = q !== undefined ? q-1 : 0
        var payloadData = {
            menu_item_price: "",
            menu_item_discount: "",
            customizable_price: 0,
            item_uuid: data.item_uuid,
            quantity: quantity,
            multis: [],
            addons: []
        }
        if (quantity > 0)
            dispatch({type: 'changeItemQuantity', payload:payloadData})
        else
            dispatch({type: 'removeItemQuantity', payload:payloadData})
    }

    const addToCart = (data:menuItemType, multis:Array<multiServingType>, addons:Array<multiAddonType>) => {
        var payloadData = {
            menu_item_price: data.menu_item_price,
            menu_item_discount: data.menu_item_discount,
            customizable_price: customizablePrice,
            item_uuid: data.item_uuid,
            quantity: customizablePrice === 0 ? 1 : customizableOrderCount,
            multis: multis,
            addons: addons
        }
        dispatch({type: 'addItemToCart', payload:payloadData})
    }

    const toCartHandler = (event: React.MouseEvent<HTMLElement>) => {
        // props.addressHandler(true)
        navigate('/cart');
    }

    const initCustomizableItem = () => {
        setIsCustomMenuOpen(false);
        setCustomItem(null);
        setCustomizableOrderCount(1);
        setCustomizablePrice(0);
        setMultiRowArr([]);
        setAddonRowArr([]);
        setMultiErrorArr([]);
        setMultiErrorArr([]);
        setMultis([]);
        setAddons([]);
    }

    return (
        <div className="menucontainer">
            <div className="meals-button-div">
                {
                    meals.map((meal) => 
                        <button className={`${activeMeal === meal.meal_uuid ? "meal-button-active" : "meal-button-deactive"}`} 
                            key={meal.meal_uuid}
                            onClick={() => setActiveMeal(meal.meal_uuid)}
                        >
                            {meal.meal_title}
                        </button> 
                    )
                }
            </div>
            <div className="menus">
            {
                categoryMenus.map((category) => 
                    category.menu_items.length > 0 &&
                    <div id={category.category_uuid} key={category.category_uuid} className="categoryItemMap">
                        <h1 className="categoryHeadline">{category.category_name}</h1>    
                        {
                            category.menu_items.map((menu_item) => 
                                <div key={menu_item.item_uuid} className="menu">
                                    <div className="menuItemDetails">
                                        <div className="avilablity">
                                            <img src={menu_item.item_mode === "1" ? "avilable.png" : "notAvilable.png"} alt="veg" />
                                            { menu_item.menu_item_label && <p className="tag">{menu_item.menu_item_label}</p> }
                                            { menu_item.menu_item_discount !== '0' && <p className="tag" style={{marginLeft:'5px'}}>{menu_item.menu_item_discount}%-off</p> }
                                        </div>
                                        <h1 className="item-name">{menu_item.item_name}</h1>
                                        <h3 className="item-price">{currency} {menu_item.menu_item_price}</h3>
                                        <p className="item-desc">{menu_item.menu_item_description}</p>
                                    </div>
                                    <div className="menuleft">
                                        <img src="https://images.indianexpress.com/2021/11/GettyImages-sweets-Diwali-1200.jpg" alt={``} />
                                        {
                                            state.find((s)=>s.item_uuid === menu_item.item_uuid) ?
                                            <button className={`addToCart activeAddCartBtn`}>
                                                <span className="fas fa-minus"
                                                    onClick={(e) => cartAmountDecreaseHandler(e, menu_item)}> 
                                                </span>
                                                <span className="count">{state.find((s)=>s.item_uuid==menu_item.item_uuid)?.quantity}</span>
                                                <span className="fas fa-plus"
                                                    onClick={(e) => cartAmountIncreaseHandler(e, menu_item)}>
                                                </span>
                                            </button>:
                                            <button className="addButton" 
                                                onClick={() => {
                                                    (menu_item.menu_item_addons.length > 0 || menu_item.menu_item_multi.length > 0) && setIsCustomMenuOpen(!isCustomMenuOpen); 
                                                    (menu_item.menu_item_addons.length > 0 || menu_item.menu_item_multi.length > 0) ? setCustomItem(menu_item) : addToCart(menu_item, [], []);
                                                }}>
                                                Add
                                            </button>
                                        }
                                        {
                                            (menu_item.menu_item_addons.length > 0 || menu_item.menu_item_multi.length > 0) && <h4>customizable</h4>
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </div>
                )
            }
            </div>
            <div className="allcategoryList" style={{ bottom: state.length > 0 ? "3.5rem" : '1rem' }}>
                <div className={`menulist`}>
                    <div className={`${isCategoryOpen ? "showCategory" : ""} categoryList`}>
                        {
                            categoryMenus.map((category, i) =>
                            {return category.menu_items.length > 0 &&
                                <ScrollLink id={`${i}`} onClick={() => { setIsCategoryOpen(!isCategoryOpen); setClickedId(i.toString()) }}
                                    smooth={true} duration={1000} to={category.category_uuid} className={`${clickedId === i.toString() ? 'activeMenuList' : ""} categorybtn`}
                                    key={i}>
                                    {category.category_name} <span className="categoryLength">{category.menu_items.length}</span>
                                </ScrollLink>
                            })
                        }
                    </div>
                    {
                        !isCategoryOpen ?
                            <button className="showMenuListBtn" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>Categories</button>
                            :
                            <button className="showMenuListBtn" onClick={() => setIsCategoryOpen(!isCategoryOpen)}><i className="fas fa-times"></i> Close</button>
                    }
                </div>
            </div>
            <div className={`${isCustomMenuOpen ? "activeCustomuze" : ""} customize`}>
                <div className={`${isCustomMenuOpen ? "activeCustomuze" : ""} csMenu`}>
                    <button className="closeCustomizable"
                        onClick={() => {
                            initCustomizableItem();
                        }}>
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="customizeMenu">
                        <div className="menuCus">
                            <div className="itemDetails" style={{ display: 'inline'}}>
                                <img src={customItem?.item_mode === "1" ? "avilable.png" : "notAvilable.png"} alt="veg" />
                                <span style={{ marginLeft: '10px' }}>{ customItem?.item_name}</span>
                            </div>
                            <div style={{height:'200px', overflowY:'scroll', width:'100%'}}>
                            { 
                            customItem?.menu_item_multi.map((citem, i) => 
                                <div key={i} style={{ width: '100%' }}>
                                    <div className="optionsExtra">
                                        <h2>{citem.multi_title}</h2>
                                        {
                                            multiErrorArr.includes(i) ?
                                            <h6 style={{ color: 'red'}}>Select minimum 1 and maximum 1.</h6> :
                                            <h6>Select minimum <span style={{ color: 'red' }}>1</span> and maximum <span style={{ color: 'red' }}>1</span>.</h6>
                                        }
                                    </div>
                                    { citem.multi_item_details.map((detail, k) => {
                                        return <div className="customOptions" key={k}>
                                            <div className="csoption">
                                                <h4>{detail.item_multi_name}</h4>
                                                <div className="prAndSel">
                                                    <h4>{currency}{detail.item_multi_price}</h4>
                                                    <input 
                                                        type="checkbox"
                                                        name={detail.item_multi_name}
                                                        value={detail.item_multi_price} 
                                                        onChange={(e) => selectPrice(e, {customizable_item_type: "serving", customizable_index:i})}/>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                    <div style={{borderBottom: '1px solid lightgrey', width: '100%'}}></div>
                                </div>
                            )
                            }
                            { 
                            customItem?.menu_item_addons.map((citem, i) => 
                                <div key={i} style={{ width: '100%' }}>
                                    <div className="optionsExtra">
                                        <h2>{citem.addon_title}</h2>
                                        {   
                                            addonErrorArr.includes(i) ?
                                            <h6 style={{ color: 'red'}}>Select minimum {citem.addon_min} and maximum.{citem.addon_max}</h6> :
                                            <h6>Select minimum <span style={{ color: 'red' }}>{citem.addon_min}</span> and maximum <span style={{ color: 'red' }}>{citem.addon_max}</span>.</h6>
                                        }
                                    </div>
                                    { citem.addon_item_details.map((detail, k) => {
                                        return <div className="customOptions" key={k}>
                                            <div className="csoption">
                                                <h4>{detail?.item_name}</h4>
                                                <div className="prAndSel">
                                                    <h4>{currency}{detail.price}</h4>
                                                    <input
                                                        id={detail.item_uuid} 
                                                        type="checkbox"
                                                        name={detail?.item_name} 
                                                        value={detail.price} 
                                                        onChange={(e) => selectPrice(e, {customizable_item_type: "addon", customizable_index:i})}/>
                                                </div>
                                            </div>
                                        </div>
                                    })}
                                    <div style={{borderBottom: '1px solid lightgrey', width: '100%'}}></div>
                                </div>
                            )
                            }
                            </div>
                        </div>
                        <div className="csButtons">
                            <button className="quantitybtn">
                                <span className="fas fa-minus"
                                    onClick={(event: React.MouseEvent<HTMLElement>) => { customizableOrderCount > 1 && setCustomizableOrderCount(customizableOrderCount-1)}}>
                                </span>
                                {customizableOrderCount}
                                <span className="fas fa-plus"
                                    onClick={(event: React.MouseEvent<HTMLElement>) => { setCustomizableOrderCount(customizableOrderCount+1)}}>
                                </span>
                            </button>
                            <button className="additem" 
                                onClick={addCustomizableItemHandler}>Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${state.length ? "activeCustomuze" : ""}`} style={{ zIndex:40}}>
                <div className={`${state.length ? "activeCustomuze" : ""} csMenu`} onClick={toCartHandler}>
                    <div className="popupMenu">
                        <div className="popupdiv">
                            <span>Your order({state.reduce((p, c) => p + c.quantity, 0)})</span>
                            <span>Subtotal:{state.reduce((p, c) => p + 
                                (parseFloat(c.menu_item_price) + c.customizable_price) * (1-parseFloat(c.menu_item_discount)/100) * c.quantity, 0)} 
                            </span>
                            <span className="fas fa-chevron-right"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottomDiv"></div>
        </div>
    )
}
