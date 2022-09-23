import Navbar from "./Navbar";
import { outletDetailsType } from "../types";
import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { localServerUrl, remoteServerUrl } from "../contexts/Constants";
export default function NavbarContainer() {

  const [isLoading, setIsLoading] = useState(true);
  const [outletDetails, setOutletDetails] = useState<outletDetailsType | null>(null);

  useEffect(() => {
    axios
    .get(remoteServerUrl + "outlet/detail")
    .then((response) => {
      setOutletDetails(response.data.outlet_details);
      setIsLoading(false);
    }).catch((err) => {
      console.log(err);
    });
  }, []);
  
  return (
    <Fragment>
      {isLoading ? (
        <div>Loading</div>
      ) : (
        <Navbar outletDetails={outletDetails} />
      )}
    </Fragment>
  );
}
