import { useEffect, useState } from "react";
import { animateScroll as scroll } from "react-scroll";
import { Actions, useMenuContext } from "../contexts/MenuProvider";
import { outletDetailsType } from "../types";

export default function Navbar(props: {
  outletDetails: outletDetailsType | null;
}) {
  const { dispatch } = useMenuContext();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <nav className="nav">
      {scrollPosition < 150 ? (
        <div className="navcontainer">
          <div className="maincontent">
            <div className="navleft">
              <div className="menubar">
                <button
                  onClick={() =>
                    dispatch({ type: Actions.TOOGLE_SIDEBAR_MENU })
                  }
                  className="menuIcon"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                <h1 className="navName" onClick={() => scroll.scrollToTop()}>
                  {props.outletDetails?.outlet_name}
                </h1>
              </div>
            </div>
            <div className="hotelInfo">
              <div className="navdesc">
                <div className="addF">
                  <h2 className="navNumber">
                    <i className="fas fa-phone"></i>{" "}
                    {props.outletDetails?.outlet_mobile}
                  </h2>
                </div>
                <div
                  className={`navAddress ${isAddressOpen ? "showAddress" : ""}`}
                >
                  {/* Address */}
                  <h1 onClick={() => setIsAddressOpen(!isAddressOpen)}>
                    {props.outletDetails? props.outletDetails.outlet_address.outlet_typed_address + 
                      " " + props.outletDetails.outlet_address.outlet_town + 
                      " " + props.outletDetails.outlet_address.outlet_district +
                      " " + props.outletDetails.outlet_address.outlet_area_pin : ''}
                    <span>
                      <i className="fas fa-ellipsis-h"></i>
                    </span>
                  </h1>
                  <div className="more-details">
                    <h3>
                      {props.outletDetails?.outlet_address.outlet_town}{" "}
                      {props.outletDetails?.outlet_address.outlet_district}{" "}
                      {props.outletDetails?.outlet_address.outlet_state}
                      {" - "}
                      {props.outletDetails?.outlet_address.outlet_area_pin}
                    </h3>
                    {/* Categories */}
                    <h3>Chinese, South Indian, Fast Food</h3>
                    {/* Extra Details 
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Ab nobis.
                    </p> */}
                  </div>
                </div>
              </div>
              {/* Logo */}
              <img
                className="info_image"
                // src={props.outletDetails?.outlet_logo}
                src="navlogo.png"
                alt="desc_logo"
              />
            </div>
          </div>
          <div className="searchbar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="search" />
          </div>
        </div>
      ) : (
        <div className="stick">
          <div className="stickyNav">
            <div className="stickyNavleft">
              <i
                onClick={() => dispatch({ type: Actions.TOOGLE_SIDEBAR_MENU })}
                className="fas fa-ellipsis-v"
              ></i>
              <h1 className="stickyNavHeading">
                {props.outletDetails?.outlet_name}
              </h1>
            </div>
            <div className="searchbar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="search" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
