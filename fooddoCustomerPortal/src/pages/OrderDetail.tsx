import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SmallNav from "../components/SmallNav";
import { orderType } from "../types";
import { orderDetails } from "./Orders";

export default function OrderDetail() {
    const params = useParams();
    const [historyItem, setHistoryItem] = useState<orderType | null>(null)
    useEffect(() => {
        setHistoryItem(orderDetails.filter(data => data.id === params.id)[0]);

        return () => {
            setHistoryItem(null);
        }
    }, [params.id])
    console.log(historyItem);
    return (
        <div className="orderDetails">
            <SmallNav to='/orders' headline={historyItem?.resturantName as string} needSearchBar={false} />
            <div className="ordersummary">
                <h1>Order Summary</h1>
                <div className="summary">
                    <h1>{historyItem?.resturantName}</h1>
                    <h4>{historyItem?.resturantDetails}</h4>
                    <h5><span className="fas fa-phone"></span> {historyItem?.resturantMobileNumber}</h5>
                    <h6>The order with {historyItem?.resturantName} was {historyItem?.status}</h6>
                    <div className="yourOrder">
                        <h1>Your Order</h1>
                        <div className="ordername">
                            {
                                historyItem?.isVeg ?
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMteAKdX-P1OY8MjE5Li9YDZJAXI_hsAZ47OWYhh_HCCK76_N_E1hr1QUgnGPIIk8RmB8&usqp=CAU" alt="veg" />
                                    :
                                    <img src="https://www.suratwale.com/assets/images/product/60a2b3bc9a1608.91502801nonveg_icon.png" alt="nonveg" />
                            }
                            <h3>{historyItem?.name}</h3>
                        </div>
                        <div className="orderpricetag">
                            <div className="quantityAndPrice">
                                <button>{historyItem?.quantity}</button>
                                <span>x</span>
                                <h4>$ {historyItem?.price}</h4>
                            </div>
                            <div className="totalQuantityPrice">
                                <h4>${historyItem && historyItem?.quantity * historyItem?.price}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="lastTotal">
                        <h4>Total</h4>
                        <h4>${historyItem && historyItem?.quantity * historyItem?.price}</h4>
                    </div>
                </div>
                <button className="repeatorder"><span className="rspan">Repeat Order</span><span className="lspan">VIEW CART ON NEXT PAGE</span></button>
            </div>
        </div>
    )
}
