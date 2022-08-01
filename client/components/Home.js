import axios from 'axios'
import React, { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
import { debounce } from 'lodash'
import { getLoggedInUserId } from '../lib/auth'
import { Link } from 'react-router-dom'
import Carousel from './Carousel'

const debouncedSave = debounce((query, updateSearchResults) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=gb&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`)
    .then(({ data }) => {
      const search = data.features.map(location => {
        return {
          id: location.id,
          placeName: location.place_name,
          location: {
            lat: location.center[1],
            long: location.center[0]
          }
        }
      })
      updateSearchResults(search)
    })
}, 500)

export default function Home({ history }) {
  const [items, updateItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLocation, updateSearchLocation] = useState('')
  const [query, updateQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])
  const [selectedLocation, updateselectedLocation] = useState({})
  const [postings, updatePostings] = useState(false)
  const [logIn, updateLogin] = useState(false)
  const [userId, setUserId] = useState('')
  const [userLocation, setUserLocation] = useState({})
  const [userTown, setUserTown] = useState('')

  // const [categories, updateCategories] = useState([])

  const categories = ['entertainment', 'clothing', 'home_and_garden', 'food_and_drink', 'motor', 'children']
  // const type = ['services', 'goods']

  useEffect(() => {
    axios.get('/api/items')
      .then(resp => {
        updateItems(resp.data)
      })
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

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get(`/api/users/${userId}`)
        setUserLocation({ lat: data.lat, long: data.lng })
        setUserTown(data.town)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUser()
  }, [userId])

  useEffect(() => {
    debouncedSave(query, updateSearchResults)
  }, [query])

  async function handleChange(event) {
    event.preventDefault()
    const value = event.target.value
    setSearchTerm(value)
  }

  function createSearchQuery(event) {
    updateQuery(event.target.value)
    updateSearchLocation(event.target.value)
  }

  function handlePlaceSelect({ placeName, location }) {
    updateselectedLocation(location)
    updateSearchResults([])
    updateSearchLocation(placeName)
  }

  function handleSubmit(event) {
    event.preventDefault()
    history.push({
      pathname: '/items',
      state: {
        searchTerm: searchTerm,
        selectedLocation: selectedLocation,
        searchLocation: searchLocation
        // get this out on the other side by: props.location.state.searchFilter
      }
    })
  }

  function swapPostings() {

    updatePostings(!postings)
  }

  
  return <div className="main">

    <section className="hero hero-background" style={{ backgroundImage: 'url(https://i.imgur.com/R8agYgr.png)', backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
      <div className="hero-body">



        <div className="columns">
          <div className="column is-1"></div>
          <div className="column is-11">

            <div className="title-container">

              <div className="columns">

                <div className="column is-8">
                  <div className="container">
                    <p className="logo-title">Baggle</p>
                    <p
                      className="subtitle is-4"
                      style={{ color: 'whitesmoke' }}>Barter, bargain, haggle, <span style={{ color: 'whitesmoke', fontSize: '35px', fontFamily: 'Mouse Memoirs' }}>Baggle!</span></p>
                  </div>
                  <div className="container mt-4">
                    <Link to={'/signup'}><button className="hero-button">Sign up</button></Link>
                  </div>

                  <div className="search-container">
                    <form onSubmit={handleSubmit}>
                      <div className="tile is-8 search-container">

                        <div className="tile box center-row">
                          <div className="left-search">
                            <input
                              type="text"
                              placeholder="What?"
                              className="input is-info"
                              onChange={(event) => handleChange(event)}
                              value={searchTerm}
                            />
                          </div>
                          <div className="right-search">
                            <input
                              className="input is-info"
                              id="input-width"
                              type="text"
                              placeholder="Where?"
                              onChange={createSearchQuery}
                              value={searchLocation}
                              autoComplete="off"
                            />
                          </div>
                        </div>

                        <button className="submit-hero">Submit</button>


                        {searchResults.length > 0 &&
                          <div className='dropdown is-active is-fullwidth'>
                            <div className='dropdown-menu'>
                              <div className='dropdown-content'>
                                {searchResults.map((place) => {
                                  return <div key={place.id}>
                                    <div className='dropdown-item' id='cardHover' onClick={() => handlePlaceSelect(place)}>{place.placeName}</div>
                                    <hr className="dropdown-divider"></hr></div>
                                })}
                              </div>
                            </div>
                          </div>}


                      </div>
                    </form>
                  </div>

                </div>

                <div className="column is-4">
                </div>

              </div>
            </div>


          </div>
        </div>
      </div>
    </section>




    <section className='section'>
      <div className="container">
        <article className="copy-box">

          <div className="columns">
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <p className="quote-text">"My wardrobe is bursting! I have so many clothes but I don't want to chuck them out!"</p>
                  <p className="subtitle is-6 has-text-right red-text"> - Jane from London</p>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <p className="quote-text">"I had so many courgettes on the allotment this year, I'll never eat them all!"</p>
                  <p className="subtitle is-6 has-text-right red-text"> - Mike from Halifax</p>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <p className="quote-text">"I wonder if someone would prune my roses if I offered them a homemade cake?"</p>
                  <p className="subtitle is-6 has-text-right red-text"> - Rona from Dundee</p>
                </div>
              </div>
            </div>
          </div>



          <div className="columns">

            <div className="column is-3">
              <div className="home-image-container">
                <img src="https://i.imgur.com/oSz7gTP.png" />
                <img src="https://i.imgur.com/5LGg4Kl.png" className="home-image-right" />
              </div>
              <div className="card">
                <div className="card-content">
                  <p className="quote-text">What can I <span style={{ color: '#B24231', fontFamily: 'Mouse Memoirs', fontSize: '30px', fontWeight: 'normal' }}>Baggle?</span></p>
                  <p className="text">Anything you like! Have an item you no longer need? Baggle it! A skill that you can exchange? Baggle it! Upload your Baggle and wait for others to make offers or use it to baggle for other items.</p>
                </div>
              </div>
            </div>

            <div className="column is-6">
              <div className="container-welcome">
                <div className="main-title-text has-text-centered">
                  <p className="large-home-title">Welcome to <span style={{ color: '#B24231', fontFamily: 'Mouse Memoirs', fontSize: '80px' }}>Baggle!</span></p>
                </div>


                <div className="content px-4">
                  <p className="homepage-copy">We're is bringing back the age-old art of bartering - saving you money and helping you connect with your community.</p>
                  <p className="homepage-copy">With Baggle, you can find all the things you love, for free! Come and join our thriving group of Bagglers to make swaps and make friends!</p>
                </div>

              </div>
            </div>

            <div className="column is-3">
              <div className="home-image-container">
                <img src="https://i.imgur.com/scvXmVz.png" />
                <img src="https://i.imgur.com/fDkEjlD.png" className="home-image-right" />
              </div>
              <div className="card">
                <div className="card-content">
                  <p className="quote-text">How do I <span style={{ color: '#B24231', fontFamily: 'Mouse Memoirs', fontSize: '30px', fontWeight: 'normal' }}>Baggle?</span></p>
                  <p className="text">Browse the site for items and nearby Bagglers to find something you like. Then hit that Baggle Button! Just make you have something to Baggle!</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>


    <section className="carousel-section">
      <div className="container">
        <div className="main-title-text has-text-grey-lighter mb-4">
          <p>Latest <span style={{ color: '#B24231', fontFamily: 'Mouse Memoirs', fontSize: '50px', textShadow: '2px 2px 2px black' }}>Baggles</span> recommended for you:</p>
        </div>
        <div className='has-text is-centered'>
          {postings ? <div className='button is-size-5' onClick={() => swapPostings()}>Sort by newest first</div>
            : <div className='button is-size-5' onClick={() => swapPostings()}>Sort by closest first</div>}
        </div>
        <div className="container is-max-widescreen">
          {categories.map((category, i) => {
            return <div className='section white-link' key={i}>
              <Carousel items={items} category={category} postings={postings} userLocation={userLocation} />
            </div>
          })}
        </div>
      </div>
    </section>
  </div >
}

