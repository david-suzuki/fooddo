import { useEffect, useState } from "react"

export default function AddressDropdownMenu( 
    props: {
        onEditAddress: (index: number) => void,
        onDeleteAddress: (index: number) => void, 
        index:number
    }) 
    {

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const menuHandler = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setIsMenuOpen(!isMenuOpen)
    }

    const toEdit = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setIsMenuOpen(!isMenuOpen)
        props.onEditAddress(props.index)
    }

    const toDelete = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setIsMenuOpen(!isMenuOpen)
        props.onDeleteAddress(props.index)
    }

    return (
        <div className="dropdown">
            <span className="fas fa-ellipsis-v" style={{paddingLeft: '60px'}} onClick={ menuHandler }></span>
            {
                isMenuOpen && 
                <div className="dropdown-content">
                    <span onClick={ toEdit }>Edit</span>
                    <span onClick={ toDelete }>Delete</span>
                </div>
            }
        </div>
    )
}