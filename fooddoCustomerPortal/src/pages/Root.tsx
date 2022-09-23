import React, { Fragment, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { NavbarContainer } from '../components'
import SideMenu from "../components/SideMenu";
import { useMenuContext } from "../contexts/MenuProvider";
import { useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Root(props: {dateHandler: (date: Date) => void}) {
    const location = useLocation();
    const { state: { isSideMenuOpen } } = useMenuContext()
    const [date, setDate] = useState(new Date());

    const handleDateSelect = (date:Date) => {
        setDate(date)
        props.dateHandler(date)
    }

    const handleDateChange = (date:Date) => {
        // console.log(date)
    }

    return (
        <Fragment>
            {   
                location.pathname === "/schedule" &&
                <div className="date-picker-div">
                    <DatePicker
                        dateFormat="yyyy-MM-dd"
                        selected={date}
                        wrapperClassName="date-picker"
                        onSelect={handleDateSelect} 
                        onChange={handleDateChange} />
                </div>
            }
            {
                isSideMenuOpen &&
                <SideMenu />
            }
            <NavbarContainer />
            <div className="home">
                <div className="container">
                    <Outlet />
                </div>
            </div>
        </Fragment>
    )
}
