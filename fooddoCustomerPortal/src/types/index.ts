// export type menuType = {
//   id: string;
//   name: string;
//   isVeg: boolean;
//   category: string;
//   description: string;
//   price: number;
//   tags?: string[];
//   imageUrl?: string;
//   isCustomizable: boolean;
//   inCart: boolean;
// };
export type cartType = {
  id: string;
  name: string;
  isVeg: boolean;
  quantity: number;
  price: number;
};
export type orderType = {
  id: string;
  quantity: number;
  name: string;
  time: string;
  img?: string;
  resturantMobileNumber: number;
  status: "Delivered" | "Scheduled" | "Dine-n" | "Picked";
  price: number;
  resturantName: string;
  resturantDetails: string;
  isVeg: boolean;
};

export type outletDetailsType = {
  outlet_name: string;
  outlet_mobile: string;
  outlet_email: string;
  outlet_logo: string;
  outlet_address: {
    outlet_area_pin: string;
    outlet_typed_address: string;
    outlet_town: string;
    outlet_district: string;
    outlet_state: string;
    outlet_country: string;
  };
};

export type outletType = {
  outlet_details: outletDetailsType,
  setup: {
    currency_sign: string,
    decimal_length: string,
    outlet_time_zone: string
  }
}

type serviceType = {
  service_name: string,
  service_status: string,
  button_status: string
}
export type servicesType = [
  serviceType, serviceType, serviceType, serviceType
];

export type categoryType = {
  category_name: string,
  category_uuid: string,
  outlet_uuid: Array<string>
}

type itemAddonType = {
  addon_title: string,
  addon_min: string,
  addon_max: string,
  addon_item_details: Array<{
    item_uuid: string,
    menu_item_addon_uuid: string,
    price: string,
    item_name: string
  }>
}

type itemMultiType = {
  multi_title: string
  multi_item_details: Array<{
    item_multi_name: string,
    menu_item_multi_uuid: string,
    item_multi_price: string
  }>
}

export type menuItemType = {
  item_uuid: string,
  item_name: string,
  item_mode: string,
  menu_item_description: string,
  menu_item_price: string,
  menu_item_discount:string,
  menu_item_label: string,
  menu_item_sort_order: string,
  menu_item_addons: Array<itemAddonType>,
  menu_item_multi: Array<itemMultiType>,
}

export type menuType = {
  category_uuid: string,
  menu_items: Array<menuItemType>
}

export type itemType = {
  item_uuid: string,
  item_name: string,
  item_mode: string,
  outlet_wise_item_details: Array<{
    other_details: {
      item_gst: string,
      item_vat: string
    }
  }>
}

export type categoryMenuType = {
  category_name: string,
  category_uuid: string,
  menu_items: Array<menuItemType>
}

export type mealType = {
  meal_title: string,
  status: string,
  editing_allowed: string,
  meal_uuid: string,
  outlet_uuid: string
}
