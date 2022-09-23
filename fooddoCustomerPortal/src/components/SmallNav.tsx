import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function SmallNav({ to, headline, needSearchBar }: { to: string, headline: string, needSearchBar: boolean }) {
    const navigate = useNavigate();
    
    return (
        <div className="smallNav">
            <div className="cartNav">
                <button onClick={() => navigate(-1)} className="backButton">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1>{headline}</h1>
            </div>
            {
                needSearchBar &&
                <div className="search">
                    <div className="searchbar">
                        <i className='fas fa-search'></i>
                        <input type="text" placeholder='search' />
                    </div>
                </div>
            }
        </div>
    )
}
