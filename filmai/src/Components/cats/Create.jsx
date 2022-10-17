import { useContext, useState } from 'react';
import Cats from '../../Contexts/Cats';

function Create() {

const [title, setTitle] = useState ('');

const { setCreateData } = useContext(Cats);


const add = () => {
  setCreateData({
    title,
  
    
  });
  setTitle('');
  
}


  return (
    // idesim is bootstarpo
    <div className="card m-4">
      <h5 className="card-header">New Cat</h5>
      <div className="card-body">
        <div class="mb-3">
          <label className="form-label">Category Title</label>
          <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)}/>
        </div>
       
        <button onClick={add} type="button" className="btn btn-outline-dark">Add</button>
      </div>
    </div>
  );
        }

export default Create;
