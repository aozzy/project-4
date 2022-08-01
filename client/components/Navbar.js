import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLoggedInUserId } from '../lib/auth'
import axios from 'axios'
import Avatar from '@material-ui/core/Avatar'



export default function Navbar( { history } ) {
  const [logIn, updateLogin] = useState(false)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')

  // get logged in token for current user
  useEffect(() => {
    const handleLogin = () => {
      const token = localStorage.getItem('token')
      if (token) {
        //change the button to logout
        updateLogin(true)
        setUserId(getLoggedInUserId())
      }
    }
    handleLogin()
  }, [])

  // get current logged in user, to personalise NavBar
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get(`/api/users/${userId}`)
        setUserName(data.username)
        setUserImage(data.profile_image)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [userId])

  //loggingOut
  function logOut() {
    localStorage.removeItem('token')
    location.reload()
  }

  console.log(userImage)

  return <div className="navbar" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
      <div className="navbar-item">
        <Link to={'/'}><span className="navbar-logo">Baggle</span></Link>
      </div>
    </div>

    <div className="navbar-menu">

      <div className="navbar-start">
        <div className="navbar-item">
          <Link to={'/users'}><p className="navbar-bold">Bagglers</p></Link>
        </div>
        <div className="navbar-item">
          <Link to={'/items'}><p className="navbar-bold">Baggles</p></Link>
        </div>
        <div className="navbar-item">
          <Link to={'/about'}><p className="navbar-bold">About Baggle</p></Link>
        </div>
      </div>

      {console.log(userId)}

      {logIn ? <div className="navbar-end">
        <div className="navbar-item"><Avatar alt={userName} src={userImage} style={{ height: '50px', width: '30px' }}/></div>
        <div className="navbar-item">
          <Link 
            to={`/users/${userId}`} 
            onClick={() => 
              setTimeout(() => {
                window.location.reload()
              }, 200)} 
            className="navbar-bold">
            {userName && <strong>{userName}</strong>}
          </Link></div>
        <div className="navbar-item">
          <div className="buttons">
            <div className="button" onClick={logOut}>Log out</div>
            <div className="color-link-button button">
              <Link to={'/add_item'}><p style={{ color: 'white'}}>Post a <span className="baggle">Baggle</span></p></Link>
            </div>
          </div>
        </div>
      </div> :
        <div className="navbar-end">
          <div className="navbar-item">
            
          </div>
          <div className="navbar-item">
            {userName && <strong>Hi {userName}</strong>}</div>
          <div className="navbar-item">
            <div className="buttons">
              <div className="button">
                <Link to={'/signup'}><p className="navbar-bold">Sign up</p></Link>
              </div>
              <div className="button">
                <Link to={'/login'}><p className="navbar-bold">Log in</p></Link>
              </div>
            </div>
          </div>
        </div>}

    </div>

  </div>
  


}