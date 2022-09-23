import { NavLink } from "react-router-dom";
import { Actions, useMenuContext } from "../contexts/MenuProvider"
import { useCartContext } from "../contexts/CartProvider"

export default function SideMenu() {
    const { state: { isSideMenuOpen }, dispatch } = useMenuContext();
    const handleClose = () => {
        dispatch({ type: Actions.TOOGLE_SIDEBAR_MENU })
    }

    const { state } = useCartContext()
    return (
        <div className={`sidebar ${isSideMenuOpen ? "sideopen" : ""}`}>
            <div className="sidebarContainer">
                <button onClick={handleClose}
                    className="time-icon">
                    <i className="fas fa-times"></i>
                </button>
                <div className="links">
                    <h1 onClick={handleClose}>foodo</h1>
                    <NavLink onClick={handleClose} to='/cart'>Cart {state.length} <i className="fas fa-shopping-cart"></i></NavLink>
                    <NavLink onClick={handleClose} to='/menus'>Menu</NavLink>
                    <NavLink onClick={handleClose} to='/'>Services</NavLink>
                    <NavLink onClick={handleClose} to='/orders'>Orders</NavLink>
                </div>
            </div>
        </div>
    )
}
