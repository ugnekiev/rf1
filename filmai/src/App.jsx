import './App.scss';
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Nav from './Components/Nav';
import Home from './Components/home/Main';
import MainCat from './Components/cats/Main';
import MainMow from './Components/movies/Main';
import { login, logout, authConfig } from './Functions/auth';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {

  const [roleChange, setRoleChange] = useState(Date.now());

  return (
    <BrowserRouter>
    <ShowNav roleChange={roleChange}/>
    <Routes>
    <Route path="/" element={<RequireAuth role="user"><Home /></RequireAuth>}></Route>
    <Route path="/login" element={<LoginPage setRoleChange={setRoleChange} />} />
    <Route path="/logout" element={<LogoutPage setRoleChange={setRoleChange} />} />
    <Route path="/categories" element={<RequireAuth role="admin"><MainCat /></RequireAuth>}></Route>
    <Route path="/movies" element={<RequireAuth role="admin"><MainMow /></RequireAuth>}></Route>
    </Routes>
    </BrowserRouter>
  );
}

function ShowNav({roleChange}) {
  const [status, setStatus] = useState(1);
  useEffect(() => {
    axios.get('http://localhost:3003/login-check?role=admin', authConfig())
      .then(res => {
        setStatus(res.data.status);
      })
  }, [roleChange]);
  return <Nav status={status} />
}

function RequireAuth({ children, role }) {
  const [view, setView] = useState(<h2>Please wait...</h2>);

  useEffect(() => {
    axios.get('http://localhost:3003/login-check?role=' + role, authConfig())
      .then(res => {
        if ('ok' === res.data.msg) {
          setView(children);
        }
        else if (res.data.status === 2) {
          setView(<h2>Unauthorize...</h2>)
        }
        else {
          setView(<Navigate to="/login" replace />);
        }
      })

  }, [children, role]);

  return view;
}


function LoginPage({setRoleChange}) {
  const navigate = useNavigate();

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const doLogin = () => {
    axios.post('http://localhost:3003/login', { user, pass })
      .then(res => {
        setRoleChange(Date.now());
        if ('ok' === res.data.msg) {
          login(res.data.key);
          navigate('/', { replace: true });
        }
      })
  }
  return (
    <div>
      <div>name: <input type="text" value={user} onChange={e => setUser(e.target.value)}></input></div>
      <div>password: <input type="password" value={pass} onChange={e => setPass(e.target.value)}></input></div>
      <button onClick={doLogin}>Login</button>
    </div>
  );
}

function LogoutPage({setRoleChange}) {
  useEffect(() => {
    logout();
    setRoleChange(Date.now());
  }, [setRoleChange]);
  
  return (
    <Navigate to="/login" replace />
  )
}

export default App;