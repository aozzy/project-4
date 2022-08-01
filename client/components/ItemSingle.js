import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { isCreator, getLoggedInUserId } from '../lib/auth'
import { Link } from 'react-router-dom'
import '../styles/style.scss'
import Icon from '@material-ui/core/Icon'
import ItemUpdateForm from './ItemUpdateForm'
import ClipLoader from 'react-spinners/ClipLoader'
import { AccordionSummary } from '@material-ui/core'



export default function ItemSingle({ match, history }) {
  const offeredListid = match.params.offeredItemid
  const itemid = match.params.itemid
  const [title, setTitle] = useState('')
  const [item, updateItem] = useState({})
  const [userId, setUserId] = useState('')
  const [offeredList, updateOfferedList] = useState([])
  const [currentUser, updateCurrentUser] = useState({})
  const [loading, updateLoading] = useState(true)
  const [wishlisted, updateWishlisted] = useState(0)
  const [userData, updateUserData] = useState([])
  const [modalState, setModalState] = useState(false)
  const [currentUserInventory, updateCurrentUserInventory] = useState([])
  const [editState, updateEditState] = useState(false)
  const [singleItem, getSingleItem] = useState({})
  const [logIn, updateLogin] = useState(false)
  const [onWishlist, toggleOnWishlist] = useState(false)

  const [modalStateText, setModalStateText] = useState('')
  const token = localStorage.getItem('token')
  const [commentData, updateCommentData] = useState('')




  useEffect(() => {
    async function fetchItem() {
      try {
        const { data } = await axios.get(`/api/items/${itemid}`)
        updateItem(data)
        updateOfferedList(data.offers)
      } catch (err) {
        console.log(err)
      }
    }
    fetchItem()
  }, [])

  const [formData, updateFormData] = useState({
    name: '',
    typeof: '',
    category: '',
    description: '',
    image: '',
    listed: 'true'
  })

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get(`/api/items/${itemid}`)
      getSingleItem(data)
      const mappedData = { ...data }
      updateFormData(mappedData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleLogin = () => {
      const token = localStorage.getItem('token')
      if (token) {
        updateLogin(true)
        setUserId(getLoggedInUserId())
      } else {
        updateLogin(false)
      }
    }
    handleLogin()
  }, [])


  async function Offer(offeredItemid) {
    try {

      
      const { data } = await axios.put(`/api/offers/${itemid}/${offeredItemid}`, {},
        { headers: { Authorization: `Bearer ${token}` } })
      updateItem(data)
    } catch (err) {
      console.log(err)
    }
    
    location.reload()
  }




  async function Swap(offeredItemid) {
    try {
      
      
      const { data } = await axios.put(`/api/swap/${itemid}/${offeredItemid}`, {},
        { headers: { Authorization: `Bearer ${token}` } })
      updateItem(data)
    } catch (err) {
      console.log(err)
    }

    
    location.reload()
  }





  async function handleDelete() {
    await axios.delete(`/api/items/${itemid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    location.reload()
  }
  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get('/api/users')
      updateUserData(data)
      updateLoading(false)
    }
    fetchData()
  }, [])
  // console.log(userData)




  function handleChange(event) {
    updateCommentData(event.target.value)
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    updateFormData({ ...formData, [name]: value })
  }

  async function handleComment(e) {
    e.preventDefault()
    const newCommentData = { content: commentData }
    try {
      const { data } = await axios.post(`/api/items/${itemid}/comments`, newCommentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }

    setTitle('')
    // updateItem(data)
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    const newFormData = {
      ...formData
    }
    try {
      await axios.put(`/api/items/${itemid}`, newFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('editing item')
      updateEditState(false)
      location.reload()
    } catch (err) {
      console.log('ERROR!')
      console.log(err)
    }
  }



  async function fetchCurrentUserInventory() {
    const token = localStorage.getItem('token')
    try {
      const { data } = await axios.get('/api/current_user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateCurrentUserInventory(data.inventory)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  useEffect(() => {
    fetchCurrentUserInventory()
  }, [])


  async function handleDeleteComment(commentId) {
    try {
      await axios.delete(`/api/items/${itemid}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      location.reload()
    } catch (err) {
      console.log(err.response.data)
    }
  }

  // ! CATHY

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get(`/api/users/${userId}`)
        // console.log(data)
        updateCurrentUser(data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [userId])



  useEffect(() => {
    if (!currentUser.wishlist) return
    const wishlist = currentUser.wishlist
    wishlist.forEach((wishItem) => {
      if (parseInt(itemid) === parseInt(wishItem.id)) {
        // console.log('found on wishlist!')
        // console.log(itemid, wishItem.id)
        toggleOnWishlist(true)
        return
      } else {
        // console.log(itemid, wishItem.id)
        // toggleOnWishlist(false)
      }
    })
  }, [currentUser])




  useEffect(() => {
    updateLoading(false)
  }, [])

  async function handleAddToWishlist() {
    const newWishlistedTotal = item.wishlisted + 1
    updateWishlisted(newWishlistedTotal)
    toggleOnWishlist(true)
    console.log(newWishlistedTotal)
    try {
      await axios.put(`/api/items/${itemid}`, { wishlisted: `${newWishlistedTotal}` }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.log(err.response.data)
    }
    try {
      await axios.post(`/api/users/${currentUser['id']}/items/${itemid}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        })
      console.log('added to wishlist')
    } catch (err) {
      console.log(err.response.data)
    }
  }

  const toggleModalText = () => {
    setModalState(!modalState)
    if (modalState) {
      setModalStateText('is-active')
    } else {
      setModalStateText('')
    }
  }





  // console.log(onWishlist)

  async function handleRemoveFromWishlist() {
    try {
      const { data } = await axios.put(`/api/users/${currentUser.id}/updatewishlist/${itemid}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toggleOnWishlist(false)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  if (loading) {
    return <div className='searchBox'><ClipLoader loading={loading} size={100} /></div>
  }

  // ! END

  if (!item.owner) {
    return null
  }
 

  return <div className="container">
    <div className="columns">


      <div className="column">
        <figure className='image'>
          <img src={item.image} alt={item.name} width='100px' />
        </figure>
      </div>
      <div className="tile box is-vertical">
        <div className="contents">
          <div className="grid-header">
            <h1 className="title">{item.name}</h1>
          </div>
          <div className="column">
            <article className="tile box is-vertical">
              <div className="contents">
                <div className="grid-header">
                  <h2 className="title">About</h2>
                  {isCreator(item.owner['id']) && <button className="button is-danger" onClick={handleDelete} >☠️ Delete Item</button>}
                  {isCreator(item.owner.id) && <button className="button is-info" onClick={() => updateEditState(true)}>Edit Item <Icon>create</Icon></button>}
                </div>

                {editState === false ?
                  <div className="contents">
                    <div className="container mb-4">
                      <label>Name</label>
                      <p>{item.name}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Baggled by</label>
                      <p>{item.owner.username}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Type</label>
                      <p>{item.typeof}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Category</label>
                      <p>{item.category}</p>
                    </div>
                    <div className="container mb-4">
                      <label>Description</label>
                      <p>{item.description}</p>
                    </div>
                  </div> :
                  <div>
                    <ItemUpdateForm
                      handleEditSubmit={handleEditSubmit}
                      handleEditChange={handleEditChange}
                      formData={formData}
                    />

                  </div>}
              </div>
            </article>


            <section className="section">
              <h2>Items offered for your Baggle</h2>

              <div className="container">
                <div className="columns is-multiline is-mobile">
                  {offeredList.map((offered, index) => {
                    return <div key={offered.id} className="column is-half-desktop is-half-tablet is-half-mobile">
                      <Link
                        to={`/items/${offered.id}`}
                        onClick={() =>
                          setTimeout(() => {
                            window.location.reload()
                          }, 200)}
                      >
                        <div className="card">
                          <div className="card-content">
                            <div className="media">
                              <div className="media-content">

                                <p className="title is-4">{offered.name}</p>


                              </div>
                            </div>
                          </div>
                          <div className="card-image">
                            <figure className="image is-4by3">
                              <img src={offered.image} alt={offered.name} />
                            </figure>
                          </div>
                        </div>
                      </Link>
                      {isCreator(item.owner['id']) && <button id={offered.id} className='button is-warning pr-1' onClick={(e) => Swap(e.target.id)}>Click to Swap</button>}
                    </div>
                  })}

                </div>
              </div>


            </section>
            <div className={`modal ${modalStateText}`}>
              <div className="modal-background"></div>
              <div className="modal-card">
                <header className="modal-card-head">
                  <h2> Would you like to make an offer?</h2>
                </header>
                <section className="modal-card-body">
                  <div className="contents">




                    <form action="">
                      {!isCreator(item.owner['id']) && currentUserInventory.map((item, index) => {
                        const available = item.listed
                        return <div key={index}>
                          <div>
                            {available ? <button className='button is-primary' id={item.id} onClick={(e) => Offer(e.target.id)}>  {item.id} {item.name}  </button> :
                              <button className='button is-warning'> {item.name} </button>
                            }
                          </div>
                        </div>

                      })}
                    </form>


                  </div>
                </section>
                <footer className="modal-card-foot">

                  <button className="button" onClick={() => toggleModalText()}>Close</button>
                </footer>
              </div>
            </div>
            {(logIn && <button className='button is-info mr-2' onClick={toggleModalText}>Baggle</button>
            )}


            {logIn ? (!onWishlist ? <button className='button is-info' onClick={handleAddToWishlist}>Add to wishlist</button>
              : <button className="button" onClick={handleRemoveFromWishlist}>Remove from wishlist</button>) : <div></div>
            }

            {item.comments && item.comments.map(comment => {
              return <article key={comment._id} className="media">
                <div className="media-content">
                  <div className="content">
                    <p className="subtitle">
                      {comment.user.username}:
                    </p>
                    <p>{comment.content}</p>
                  </div>
                  <div className="field">
                    <p className="control">
                      <button
                        onClick={handleComment}
                        className="button is-info"
                      >
                        Submit
                      </button>
                    </p>

                  </div>


                </div>
                {isCreator(comment.user.id) && <div className="media-right">
                  <button
                    className="delete"
                    onClick={() => handleDeleteComment(comment.id)}>
                  </button>
                </div>}
              </article>
            })}

          </div>

        </div>


        <article className="media">
          <div className="media-content">
            <div className="field">
              <p className="control">
                <textarea
                  className="textarea"
                  placeholder="Make a comment.."
                  onChange={handleChange}
                  value={commentData.content}
                >
                </textarea>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <button
                  onClick={handleComment}
                  className="button is-info"
                >
                  Submit
                </button>

              </p>
            </div>
          </div>
        </article>

      </div>
    </div>
  </div>
}





{/* <div className="card">
  <div className="card-image">
    <figure className="image is-4by3">
      <img src={offeredItem.image} alt={offeredItem.name} />
    </figure>
  </div>
  <div className="card-content">
    <div className="media">
      <div className="media-left">

      </div>

    </div>

    <div className="content">
      {offeredItem.description}
    </div>
  </div>
</div> */}

