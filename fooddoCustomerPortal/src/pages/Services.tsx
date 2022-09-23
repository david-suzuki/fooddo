import { servicesType } from "../types";
import { useState, useEffect} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCartContext, payloadType, multiAddonType, multiServingType } from "../contexts/CartProvider"

export default function Services() {
    const [services, setServices] = useState<servicesType|null>(null);
    // const [links, setLinks] = useState<Array<string>>(["", "", "", ""])
    // const [imgs, setImgs] = useState<Array<string>>(["", "", "", ""])
    const { state, dispatch } = useCartContext()

    useEffect(() => {
        let isMounted = true;   
        axios
        .get("https://api.myfooddo.com/outlet/service")
        .then((response) => {
            console.log(response.data)
            setServices(response.data)
        }).catch((err) => {
            console.log(err);
        });

        var payloadData = {
            menu_item_price: "",
            menu_item_discount: "",
            customizable_price: 0,
            item_uuid: "",
            quantity: 0,
            multis: [],
            addons: []
        }
        dispatch({type: 'initItemsInCart', payload:payloadData})

        return () => { isMounted = false };
    }, []);
    
    const links = ["/dinein", "/delivery", "/menus", "/schedule"]
    const imgs = ['dinein.png', 'delivery.png', 'pickup.png', 'schedule.png']
    const serviceNames = ['Dine-in', 'Delivery', 'Pick-up', 'Schedule']
    
    return (
        <div className="servicePage">
            <div className="servicesContainer">
                {
                    services && services.map((data, i) =>
                        (data.service_status === "Y" && serviceNames.includes(data.service_name)) && (
                            data.button_status === "1" ?
                            <Link key={i} to={links[i]}> 
                                <div className="service">
                                    <img src={imgs[i]} alt="icon" />
                                    <span>{data.service_name}</span>
                                </div>
                            </Link> :
                            <div key={i}> 
                                <div className="service" style={{background: "lightgrey"}}>
                                    <img src={imgs[i]} alt="icon" />
                                    <span>{data.service_name}</span>
                                </div>
                                { data.button_status === '0' && <span>Currently is not available</span> }
                            </div>
                        )
                    )}
            </div>
        </div>
    )
}
