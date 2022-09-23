import React, { useReducer } from 'react'


export enum Actions {
    TOOGLE_SIDEBAR_MENU = 'toogle-sidebar-menu'
}
export type MenuContextType = {
    isSideMenuOpen: boolean
}
type SideBarOpen = {
    type: Actions.TOOGLE_SIDEBAR_MENU
}
type MenuContextActionType = SideBarOpen;


export const MenuContext = React.createContext<{
    state: MenuContextType;
    dispatch: React.Dispatch<MenuContextActionType>;
} | null>(null)

export const useMenuContext = () => {
    const context = React.useContext(MenuContext);
    if (!context) {
        throw new Error('context not working')
    }
    return context
}

const reducer = (
    state: MenuContextType,
    action: MenuContextActionType
): MenuContextType => {
    switch (action.type) {
        case Actions.TOOGLE_SIDEBAR_MENU:
            return {
                ...state, isSideMenuOpen: state.isSideMenuOpen ? false : true
            }
        default:
            return state
    }

}

export default function MenuProvider({ children }: { children: JSX.Element }) {
    const [state, dispatch] = useReducer(reducer, {
        isSideMenuOpen: false
    } as MenuContextType)
    return (
        <MenuContext.Provider value={{ state, dispatch }}>
            {children}
        </MenuContext.Provider>
    )
}
