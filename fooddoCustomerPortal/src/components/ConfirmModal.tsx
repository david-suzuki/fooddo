import { useEffect, useState } from "react"

export default function ConfirmModal(props: {onResult:(result:string) => void}) {

    const okButtonStyle = {
        borderRadius: '0.8rem',
        width: '100%',
        height: '2rem',
        margin: '20px 10px 10px 10px',
        fontSize: '1rem',
        background: "#4ac959",
        color: '#fff',
        border: 'none',
        cursor: 'pointer'
    }

    const cancelButtonStyle = {
        borderRadius: '0.8rem',
        width: '100%',
        height: '2rem',
        margin: '20px 10px 10px 10px',
        fontSize: '1rem',
        background: "white",
        color: 'gray',
        border: '2px solid lightgray',
        cursor: 'pointer'
    }

    const titleStyle = {
        fontSize: '20px',
    }

    return (
        <div className="modal" style={{zIndex:100}}>
            <div className="insideModal">
                <i className="fas fa-times" onClick={()=>props.onResult("cancel")}></i>
                <h2>Confirm</h2>
                <span style={titleStyle}>Are you sure to delete this?</span>
                <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                    <button style={cancelButtonStyle} onClick={()=>props.onResult("cancel")}>Cancel</button>
                    <button style={okButtonStyle} onClick={()=>props.onResult("ok")}>Ok</button>
                </div>
            </div>
        </div>
    )
}