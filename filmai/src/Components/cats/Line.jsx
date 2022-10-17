import { useContext } from "react";
import Cats from "../../Contexts/Cats";


function Line({ cats }) {

    const{ setDeleteData, setModalData } = useContext(Cats);

console.log(cats)
    return (
        <li className="list-group-item">
            
            <div className="line">
                <div className="line__content">
                    <div className="line__content__title">{cats.title}</div>
                </div>
                <div className="line__buttons">
                <button onClick={() => setModalData(cats)}type="button" className="btn btn-outline-primary">Edit</button>
                <button onClick={() => setDeleteData(cats)} type="button" className="btn btn-outline-danger">Delete</button>
                </div>
            </div>
        </li>
    )
}

export default Line;