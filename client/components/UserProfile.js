import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { getLoggedInUserId, isCreator } from '../lib/auth.js'
import { buildStyles, CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import Moment from 'react-moment'
import Icon from '@material-ui/core/Icon'
import AvatarGroup from '@material-ui/lab/AvatarGroup'
import Avatar from '@material-ui/core/Avatar'
import UserUpdateForm from './UserUpdateForm.js'
import ImageUpload from './ImageUpload.js'

export default function UserProfile({ match, history }) {

  const [profile, updateProfile] = useState([])
  const [loading, updateLoading] = useState(true)
  const [positiveRating, updatePositiveRating] = useState(0)
  const [negativeRating, updateNegativeRating] = useState(0)
  const [rated, updateRated] = useState(false)
  const [user, updateUser] = useState('')
  const [logIn, updateLogin] = useState(false)
  const [isProfileOwner, updateIsProfileOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(0)
  const [currentUser, updateCurrentUser] = useState({})
  const [editState, updateEditState] = useState(false)
  const [follows, toggleFollows] = useState(false)
  

  const [modalStateInv, setModalStateInv] = useState(false)
  const [modalStateInvText, setModalStateInvText] = useState('')

  const [modalStateWish, setModalStateWish] = useState(false)
  const [modalStateWishText, setModalStateWishText] = useState('')

  const [modalStateFriends, setModalStateFriends] = useState(false)
  const [modalStateFriendsText, setModalStateFriendsText] = useState('')

  const [reviewData, updateReviewData] = useState({
    content: '',
    rating: 0
  })
  const [formData, updateFormData] = useState({
    username: '',
    bio: '',
    image: '',
  })


  // ! GETS USER DATA AND COMPARES LOGGED IN USER TO PROFILE OWNER

  const userId = Number(match.params.userId)
  const token = localStorage.getItem('token')
  
  
  useEffect(() => {
    const handleLogin = () => {
      if (token) {
        setCurrentUserId(getLoggedInUserId())
        updateLogin(true)
      }
    }
    handleLogin()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`/api/users/${userId}`)
        updateProfile(data)
        updateUser(data.id)
        const totalRatings = data.positive_rating + data.negative_rating
        const positivePercent = data.positive_rating / totalRatings * 100
        const negativePercent = data.negative_rating / totalRatings * 100
        updatePositiveRating(positivePercent)
        updateNegativeRating(negativePercent)
        updateFormData({ username: data.username, bio: data.bio })
        updateLoading(false)
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchCurrentUser() {
      const token = localStorage.getItem('token')
      try {
        const { data } = await axios.get('/api/current_user', {
          headers: { Authorization: `Bearer ${token}` }
        })
        updateCurrentUser(data)
      } catch (err) {
        console.log(err.response.data)
      }
    }
    fetchCurrentUser()
  }, [])




  //! FILTER FUNCTIONS

  function profileFollowsYou() {
    if (profile.follows.includes(currentUser)) {
      console.log('They follow me')
    } else { 'They don\'t follow me' }
  }




  //! DELETE AND EDIT FUNCTIONS

  async function handleDelete() {
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.clear()
      history.push('/')
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
  }

  useEffect(() => {
    if (!currentUser.follows) return
    const followsList = currentUser.follows
    followsList.forEach((followUser) => {
      if (parseInt(userId) === parseInt(followUser.id)) {
        toggleFollows(true)
        return
      } else {
        console.log(currentUser.id, followUser.id)
      }
    })
  }, [currentUser])

  async function handleFollow() {
    try {
      await axios.post(`/api/users/${currentUserId}/users/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toggleFollows(true)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  async function unFollow() {
    try {
      await axios.put(`/api/users/${currentUserId}/removefollower/${userId}`, { }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toggleFollows(false)
    } catch (err) {
      console.log(err.response.data)
    }
  }


  // ! 9x9 MAPPING FUNCTIONS

  function mapGrid(itemArray) {
    filterItems(itemArray)
    const limitedItems = itemArray.slice(0, 9)
    return limitedItems.map((item, i) => {
      return <div className="column is-one-third" key={i}>
        <Link to={`/items/${item.id}`}>
          <div 
            className={(item.offer && item.offers.length > 0) ? 'card modal-individual-card outlined' : 'card modal-individual-card'}
          >
            <div className="card-image">
              <figure className="image is-square">
                <img src={item.image} />
              </figure>
            </div>
          </div>
        </Link>
      </div>
    })
  }

  function filterItems(itemArray) {
    const filteredItems = itemArray.filter((item) => {
      return item.listed
    })
  }

  // ! FULL MAPPING FUNCTIONS

  function mapAllItems(itemArray) {
    return itemArray.map((item) => {
      return <div className="column is-one-quarter" key={item.id}>
        <Link to={`/items/${item.id}`}>
          <div
            className={(item.offer && item.offers.length > 0) ? 'card modal-individual-card outlined' : 'card modal-individual-card'}>
            <div className="card-image">
              <figure className="image is-4by3">
                <img src={item.image} />
              </figure>
            </div>
            <div className="card-content py-1 px-1">
              <p className="text mb-4"><strong>{item.name}</strong></p>
            </div>
            <div className="card-footer py-1 px-1 spread">
              <p className="small-text">Created <Moment fromNow ago>{item.created_at}</Moment> ago.</p>
            </div>
          </div>
        </Link>
      </div>
    })
  }


  // ! HANDLE SUBMIT AND CHANGE FUNCTIONS

  async function handlePositive(event) {
    event.preventDefault()
    updateReviewData({
      ...reviewData,
      rating: 2
    })
    const originalPositive = profile.positive_rating
    const newPositive = originalPositive + 1
    const newProfileData = { positive_rating: newPositive }
    try {
      const { data } = await axios.put(`/api/users/${userId}`, newProfileData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
    updateRated(true)
  }

  async function handleNegative(event) {
    event.preventDefault()
    updateReviewData({
      ...reviewData,
      rating: 1
    })
    const originalNegative = profile.negative_rating
    const newNegative = originalNegative + 1
    const newProfileData = { negative_rating: newNegative }
    try {
      const { data } = await axios.put(`/api/users/${userId}`, newProfileData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
    updateRated(true)
  }


  function handleReviewChange(event) {
    updateReviewData({ ...reviewData, [event.target.name]: event.target.value })
  }

  async function handleReviewSubmit(event) {
    event.preventDefault()
    const newReviewData = { ...reviewData }
    try {
      const { data } = await axios.post(`/api/users/${userId}/review`, newReviewData,
        {
          headers: { Authorization: `Bearer ${token}` }
        })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
  }

  async function handleReviewDelete(reviewId) {
    // event.preventDefault()
    try {
      axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
  }


  // ! EDIT FUNCTIONS

  function handleEditChange(event) {
    updateFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    const newFormData = {
      ...formData
    }
    try {
      await axios.put(`/api/users/${currentUserId}`, newFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('editing data user')
      updateEditState(false)
      location.reload()
    } catch (err) {
      console.log('ERROR!')
      console.log(err)
    }
  }

  function toggleEditState() {
    updateEditState(true)
  }

   function toggleUpdateRated() {
     updateRated(true)
   }

  // ! MODAL FUNCTIONS

  const toggleInventoryModal = () => {
    setModalStateInv(!modalStateInv)
    if (modalStateInv) {
      setModalStateInvText('is-active')
    } else {
      setModalStateInvText('')
    }
  }

  const toggleWishlistModal = () => {
    setModalStateWish(!modalStateWish)
    if (modalStateWish) {
      setModalStateWishText('is-active')
    } else {
      setModalStateWishText('')
    }
  }

  const toggleFriendsModal = () => {
    setModalStateFriends(!modalStateFriends)
    if (modalStateFriends) {
      setModalStateFriendsText('is-active')
    } else {
      setModalStateFriendsText('')
    }
  }



  if (loading) {
    return <div>Page is Loading</div>
  }

  // ! RENDERING


  return <div className="main">

    <div className="container">


      {/*
    // * TITLE SECTION
    */}

      <section className="hero is-small">
        
        {profile.image ? <div className="hero-body banner-with-image" style={{
          backgroundImage: `url(${profile.image})`,
          backgroundSize: 'cover'
        }}>
          <div className="container has-text-centered">
            <div className="banner-profile-image-container">
              <img src={profile.profile_image} />
            </div>
            <div className="banner-text">
              <p>{profile.username}</p>
            </div>
          </div>
        </div> : <div className="hero-body banner-with-image" style={{
          backgroundColor: "#004460"
        }}>
          <div className="container has-text-centered">
            <div className="banner-profile-image-container">
              <img src={profile.profile_image} />
            </div>
            <div className="banner-text">
              <p>{profile.username}</p>
            </div>
          </div>
        </div> }

        {/*
        // * NAVBAR SECTION
        */}

        <div className="hero-foot">
          <nav className="tabs is-boxed is-fullwidth">
            <div className="container my-2">
              <ul>
                <li>
                  <a className="white-link" onClick={profileFollowsYou()}>Profile</a>
                </li>
                <li>
                  <a className="white-link" onClick={() => toggleInventoryModal()}>Up for Baggle</a>
                </li>
                {isCreator(userId) && <li>
                  <a className="white-link" onClick={() => toggleWishlistModal()}>Wishlist</a>
                </li>}
                <li>
                  <a className="white-link" onClick={() => toggleFriendsModal()}>Baggle Buddies</a>
                </li>
                {isCreator(userId) && <li>
                  <a className="white-link" onClick={() => handleDelete()}>Delete Profile</a>
                </li>}
                {!isCreator(userId) && !profile.followers.includes(currentUser) && (
                  !follows ? <li>
                    <button className="button" onClick={handleFollow}>Follow {profile.username}</button>
                  </li> :
                    <li>
                      <button className="button" onClick={unFollow}>Unfollow {profile.username}</button>
                    </li>)}
              </ul>
            </div>
          </nav>
        </div>
      </section>


      <div className={`modal ${modalStateInvText}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title title">{profile.username}'s Items Up for Baggle</p>
          </header>
          <section className="modal-card-body">
            <div className="contents">


              {profile.inventory.length > 0 ? 
                <div className="columns is-multiline">
                  {mapAllItems(profile.inventory)}
                </div> :
                <div>{profile.username} has nothing to baggle. Shame on {profile.username}!</div>}

            </div>
          </section>
          <footer className="modal-card-foot">

            <button className="button" onClick={() => toggleInventoryModal()}>Close</button>
          </footer>
        </div>
      </div>

      <div className={`modal ${modalStateWishText}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title title">Your Wishlist</p>
          </header>
          <section className="modal-card-body">
            <div className="contents">

              {profile.wishlist.length > 0 ? 
                <div className="columns is-multiline">
                  {mapAllItems(profile.wishlist)}
                </div> :
                <div>A lone tumbleweed blows gently across the empty space that is your wishlist... </div>}
            </div>
          </section>
          <footer className="modal-card-foot">

            <button className="button" onClick={() => toggleWishlistModal()}>Close</button>
          </footer>
        </div>
      </div>

      <div className={`modal ${modalStateFriendsText}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title title">{profile.username}'s Baggling Buddies</p>
          </header>
          <section className="modal-card-body">
            <div className="contents">

              {profile.follows.length > 0 ? 
                <div className="columns is-multiline">
                  {profile.follows.map((follow) => {
                    return <div className="column is-one-quarter" key={follow.id}>
                      <Link 
                        to={`/users/${follow.id}`}
                        onClick={() => 
                          setTimeout(() => {
                            window.location.reload()
                          }, 200)} 
                      >
                        <div className="card modal-individual-card">
                          <div 
                            className="card-image"
                            style={{ 
                              backgroundImage: `url(${follow.image})`,
                              backgroundSize: 'cover'
                            }}>
                            <figure className="image is-4by3">
                              <img src={follow.profile_image} />
                            </figure>
                          </div>
                          <div className="card-content">
                            <p className="text mb-4"><strong>{follow.username}</strong></p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  })}
                </div> :
                <div>🎶  All by myself, don't wanna live all by myself...  🎶 </div>}

            </div>
          </section>
          <footer className="modal-card-foot">

            <button className="button" onClick={() => toggleFriendsModal()}>Close</button>
          </footer>
        </div>
      </div>


      {/*
        // * BODY SECTION
      */}


      <section className="section">
        <div className="columns">


          {/*
            // ! COLUMN 1
            */}

          <div className="column">

            {/*
            // * ABOUT SECTION
            */}

            <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title">About</h2>
                  {!isCreator(userId) && <button className="button">Contact</button>}
                  {isCreator(userId) && <button className="button" onClick={toggleEditState}>Edit profile  <Icon>create</Icon></button>}
                </div>

                {/* {!isCreator(userId) && <div className="tags has-addons mb-0">
                  <span className="tag">{profile.username}</span>
                  <span className="tag is-primary">follows you</span>
                </div>}

                <div className="tags has-addons mb-0">
                  <span className="tag">{profile.username}</span>
                  <span className="tag is-danger">doesn't follow you</span>
                </div> */}

                {editState === false ?
                  <div className="contents">
                    <div className="container mb-4">
                      <label>Username</label>
                      <p>{profile.username}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Location</label>
                      <p>{profile.town}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Bio</label>
                      <p>{profile.bio}</p>
                    </div>

                    {profile.created_at && <p>Baggling since <span className="red-text"><Moment format="Do MMM YYYY">{profile.created_at}</Moment></span></p>}
                  </div> :
                  <div>
                    <UserUpdateForm
                      handleEditSubmit={handleEditSubmit}
                      handleEditChange={handleEditChange}
                      formData={formData}
                    />
                    <div className="content">Change your cover image by uploading a photo:</div>
                    <ImageUpload
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  </div>
                }

              </div>
            </article>

            {/*
            // * BUDDY SECTION
            */}

            <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title">Baggling Buddies</h2>
                  <button className="button" onClick={() => toggleFriendsModal()}>See All</button>
                </div>
                <AvatarGroup max={10}>

                  {profile.follows.map((follow, index) => {
                    return <Link 
                      key={index} 
                      to={`/users/${follow.id}`}
                      onClick={() => 
                        setTimeout(() => {
                          window.location.reload()
                        }, 200)} 
                    >
                      <Avatar
                        alt={follow.username}
                        key={follow.id}
                        src={follow.profile_image}
                        style={{
                          height: '100px',
                          width: '100px',
                          backgroundImage: `url(${follow.image})`,
                          backgroundSize: 'cover'
                        }} /></Link>
                  })}

                </AvatarGroup>
              </div>
            </article>

            {/*
            // * RATING SECTION
            */}

            <article className="tile box is-parent is-vertical pb-5">

              <div className="tile is-child py-2 px-2">
                <div className="contents">
                  <div className="grid-header">
                    <h2 className="title mb-4">Baggler Rating</h2>
                  </div>
                </div>
              </div>

              {positiveRating || negativeRating ? <div className="tile is-child">
                <div className="tile is-parent">
                  <div style={{ width: '200px' }}>
                    <CircularProgressbarWithChildren
                      value={positiveRating}
                      strokeWidth={8}
                      styles={buildStyles({
                        pathColor: '#00d1b2',
                        trailColor: 'transparent'
                      })}
                    >
                      <div style={{ width: '84%' }}>
                        <CircularProgressbar
                          value={negativeRating}
                          styles={buildStyles({
                            trailColor: 'transparent',
                            pathColor: '#ff3860'
                          })}
                        />
                      </div>
                    </CircularProgressbarWithChildren>
                  </div>
                  <div className="rating-container">
                    <div className="pos-rating"><p>{Math.floor(positiveRating)}% 👍<Icon>thumbUp</Icon></p></div>
                    <div className="neg-rating"><p>{Math.floor(negativeRating)}% 👎</p></div>
                  </div>
                </div>
              </div> : <div className="quote-text">{profile.username} has no reviews.</div>}

              <div className="tile is-child has-text-centered">
                <div className="contents">
                  {positiveRating < 50 && <div className="quote-text">{profile.username} is a bad Baggler! <span className="emoji">💩</span></div>}
                  {positiveRating >= 50 && positiveRating < 60 && <div className="quote-text">{profile.username} is a Neutral Baggler. <span className="emoji">😐</span></div>}
                  {positiveRating >= 60 && positiveRating < 90 && <div className="quote-text">{profile.username} is a Good Baggler <span className="emoji">😁</span></div>}
                  {positiveRating >= 90 && <div className="quote-text">{profile.username} is a Top Baggler! <span className="emoji">🤩</span></div>}
                </div>
              </div>
            </article>

            {/*
            // * WISHLIST SECTION
            */}

            {isCreator(userId) && <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title">Wishlist</h2>
                  <button className="button" onClick={() => toggleWishlistModal()}>See All</button>
                </div>
                <div className="contents">
                  <div className="grid-container">
                    <div className="columns is-multiline">
                      {mapGrid(profile.wishlist)}
                    </div>
                  </div>
                </div>
              </div>
            </article>}
          </div>


          {/*
            // ! COLUMN 2
            */}


          <div className="column is-three-fifths">



            {/*
            // * INVENTORY SECTION
            */}

            <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title">Up for Baggle</h2>
                  <button className="button" onClick={() => toggleInventoryModal()}>See All</button>
                </div>
                <div className="contents">
                  <div className="grid-container">
                    <div className="columns is-multiline">
                      {mapGrid(profile.inventory)}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/*
            // * REVIEW SECTION
            */}

            <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title mb-4">{profile.username}'s Baggle Board</h2>
                </div>
                <div className="contents mb-4">
                  {logIn ? <h2 className="subtitle">Leave {profile.username} a comment or review</h2> 
                  : <h2 className="subtitle">You need to be logged in to leave {profile.username} a review.</h2>}
                </div>
                <div className="contents">
                  {profile.other_reviews.map(review => {
                    const rating = review.rating
                    // console.log(rating)
                    return <article key={review.id} className="media">
                      <div className="media-content">
                        <div className="content">
                          <p className="title">{review.author.username}</p>
                          <p className="text"><Moment format="Do MMM YYYY @ HH:MM">{review.created_at}</Moment></p>
                          <div className="columns">
                            <p className="text column">{review.content}</p>
                            {rating === 2 && <p className="text column is-one-fifth emoji">👍</p>}
                            {rating === 1 && <p className="text column is-one-fifth emoji">👎</p>}
                            {rating === 0 && <p className="text column is-one-fifth emoji"></p>}
                          </div>
                        </div>
                      </div>

                      <div className="container">
                        {isCreator(review.author.id) && <button
                          className="button is-danger"
                          onClick={() => handleReviewDelete(review.id)}
                        >Delete Review</button>}
                      </div>
                    </article>
                  })}

                  {logIn && <article className="media">
                    <div className="media-content">
                      <div className="field">
                        <p className="control">
                          <textarea
                            className="textarea"
                            placeholder="Make a comment..."
                            onChange={handleReviewChange}
                            value={reviewData.content}
                            name={'content'}
                          />
                        </p>
                      </div>
                      <div>
                        {!rated ? <div><button className="button is-success" onClick={(e) => handlePositive(e)}>Rate Good </button>
                          <button className="button ml-2 mb-2 is-danger" onClick={(e) => handleNegative(e)}>Rate Bad</button>
                          <button className="button ml-2 mb-2" onClick={toggleUpdateRated}>Comment only</button></div> :
                          <div className="red-text baggle">Baggle loves democracy!</div>
                        }
                      </div>
                      {rated && <div className="field">
                        
                          <button
                            onClick={handleReviewSubmit}
                            className="button is-info"
                          >
                            Submit to save your review!
                          </button>
                        
                      </div>}
                    </div>
                  </article>}
                </div>
              </div>
            </article>

          </div>
        </div>
      </section>





    




    </div>
  </div>

}