import React, { useReducer } from 'react'

export type multiAddonType = {
    uuid: string,
    name: string,
    price: number
}

export type multiServingType = {
    name: string,
    price: number
}

export type payloadType = {
    menu_item_price: string,
    menu_item_discount: string,
    customizable_price: number,
    item_uuid: string,
    quantity: number,
    multis: Array<multiServingType>,
    addons: Array<multiAddonType>,
}

export const initialState = [];

type CartContextActionType = {
    type: string,
    payload: payloadType
}

export const reducer = (state: Array<payloadType>, action: {type:string, payload:payloadType}) => {
    switch (action.type) {
        case 'addItemToCart':
            return [...state, action.payload]
        case 'changeItemQuantity':
            return state.map(s => {
                if (s.item_uuid === action.payload.item_uuid) {
                    return Object.assign({}, s, { quantity: action.payload.quantity })
                }
                return s
            })
        case 'removeItemQuantity':
            return state.filter(s=>s.item_uuid !== action.payload.item_uuid)
        case 'initItemsInCart':
            return []
        default:
            throw new Error();
    }
}

export const CartContext = React.createContext<{
    state: Array<payloadType>;
    dispatch: React.Dispatch<CartContextActionType>;
} | null>(null)

export const useCartContext = () => {
    const context = React.useContext(CartContext);
    if (!context) {
        throw new Error('context not working')
    }
    return context
}

export default function CartProvider({ children }: { children: JSX.Element }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    )
}