import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartPage, Home} from './pages';
import OrderDetail from './pages/OrderDetail';
import Order from './pages/Orders';
import Root from './pages/Root';
import Services from './pages/Services';
import Dinein from './pages/Dinein';
import Delivery from './pages/Delivery';
import Schedule from './pages/Schedule';

function App() {
  const [seatUUid, setSeatUUid] = useState<string>("")
  const [showAddress, setShowAddress] = useState<boolean>(false)
  const [date, setDate] = useState<Date>(new Date)

  return (
    <React.Fragment>
      <Router>
        <Routes>
          <Route path='/' element={<Root dateHandler={(date) => setDate(date)} />}>
            <Route path='/' element={<Services />} />
            <Route path='/menus' element={<Home seatUUidHandler={(seat_uuid) => setSeatUUid(seat_uuid)} />} />
            <Route path='/dinein' element={<Dinein seatUUidHandler={(seat_uuid) => setSeatUUid(seat_uuid)} />} />
            <Route path='/delivery' element={<Delivery addressHandler={(flag)=>setShowAddress(flag)}/>} />
            <Route path='/schedule' element={<Schedule date={date}/>} />
          </Route>
          <Route path='/cart' element={<CartPage seatUUid={seatUUid} showAddress={showAddress} />} />
          <Route path='/orders' element={<Order />} />
          <Route path='/orderdetails/:id' element={<OrderDetail />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
}

export default App;
