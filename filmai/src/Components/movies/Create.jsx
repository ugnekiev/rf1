import { useContext, useState, useRef } from 'react';
import Movies from '../../Contexts/Movies';
import getBase64 from '../../Functions/getBase64'

function Create() {

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [cat, setCat] = useState(0);
  const fileInput = useRef();

  const [photoPrint, setPhotoPrint] = useState(null);

  const { setCreateData, cats } = useContext(Movies);

  const doPhoto = () => {
    getBase64(fileInput.current.files[0])
      .then(photo => setPhotoPrint(photo))
      .catch(_ => {
        // tylim
      })
  }

  const add = () => {
    setCreateData({
      title,
      price: parseFloat(price),
      cat_id: parseInt(cat),
      image: photoPrint

    });

    setTitle('');
    setPrice('');
    setCat(0);
    setPhotoPrint(null);
    fileInput.current.value = null;

  }


  return (
    <div className="card m-4">
      <h5 className="card-header">New Movie</h5>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Movie Title</label>
          <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Movie Price</label>
          <input type="text" className="form-control" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
            <option value={0} disabled>Choose from list</option>
            {
              cats?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
            }
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Movie Image</label>
          <input ref={fileInput} type="file" className="form-control" onChange={doPhoto} />
        </div>
        {photoPrint ? <div className='img-bin'>
          <label htmlFor="image-delete">X</label>
          <input id="image-delete" type="checkbox"></input>
          <img src={photoPrint} alt="upload"></img>
        </div> : null}
        <button onClick={add} type="button" className="btn btn-outline-dark">Add</button>
      </div>
    </div>
  );
}

export default Create;
