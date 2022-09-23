import { Link } from "react-router-dom";
import SmallNav from "../components/SmallNav";
import { orderType } from "../types";

export const orderDetails: orderType[] = [
    {
        id: 'id1',
        isVeg: false,
        name: "Large Pizza",
        price: 125,
        quantity: 2,
        resturantDetails: "lorem ipsum sit amet dollor dumy text",
        resturantMobileNumber: 1234567890,
        resturantName: "Domino's",
        time: "1 jan 2021",
        status: "Delivered",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2BFanf5H9xCJOl-IfN7GwSc68GO8M-Z38Ew&usqp=CAU"
    },
    {
        id: 'id2',
        isVeg: false,
        name: "Burger",
        price: 65,
        quantity: 3,
        resturantDetails: "lorem ipsum sit amet dollor dumy text",
        resturantMobileNumber: 1234567890,
        resturantName: "Domino's",
        time: "2 jan 2021",
        status: "Picked",
        img: "https://assets.bonappetit.com/photos/5d1cb1880813410008e914fc/3:2/w_1997,h_1331,c_limit/Print-Summer-Smash-Burger.jpg"
    },
    {
        id: 'id3',
        isVeg: true,
        name: "Motichur Laddu",
        price: 15,
        quantity: 1,
        resturantDetails: "lorem ipsum sit amet dollor dumy text",
        resturantMobileNumber: 1234567890,
        resturantName: "Domino's",
        time: "2 jan 2021",
        status: "Dine-n",
        img: "https://c.recipeland.com/images/r/22063/e1f83d693f535c6923bf_1024.jpg"
    },
]
export default function Order() {
    return (
        <div className="orderhistory">
            <SmallNav to='/cart' headline="Order History" needSearchBar={true} />
            <div className="orders">

                {
                    orderDetails.map((data, i) =>
                        <div className="order" key={i}>
                            <div className="ordermenu">
                                {data.img &&
                                    <img src={data.img} alt="orderimage" />
                                }
                                <div className="orderdetail">
                                    <div className="orderresturant">
                                        <h1>{data.resturantName}</h1>
                                        <h3><span className="fas fa-phone"></span> {data.resturantMobileNumber}</h3>
                                    </div>
                                    <div className="orderactions">
                                        <button>{data.status}</button>
                                        <Link to={`/orderdetails/${data.id}`}>order details <i className="fas fa-caret-right"></i></Link>
                                    </div>
                                </div>
                            </div>
                            <div className="ordertime">
                                <h1>{data.time}</h1>
                                <h4 className="ordertimeorice">$ {data.price * data.quantity}</h4>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}
