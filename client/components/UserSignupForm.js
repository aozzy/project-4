import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { debounce } from 'lodash'

const debouncedSave = debounce((searchQuery, updateSearchResults) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?country=gb&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`)
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

export default function UserSignupForm({ formData, handleSubmit, handleChange, updateFormData, errors, registrationSuccess }) {

  // const [creationSuccess, updateCreationSuccess] = useState(false)
  // const [uploadSuccess, updateUploadSuccess] = useState(false)
  const [searchQuery, updateSearchQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])

  // console.log(errors)

  useEffect(() => {
    debouncedSave(searchQuery, updateSearchResults)
  }, [searchQuery])

  function createSearchQuery(event) {
    updateSearchQuery(event.target.value)
    updateFormData({ ...formData, search: event.target.value })
  }

  function handlePlaceSelect({ placeName, location }) {
    updateFormData({ ...formData, location: placeName, lat: location.lat, lng: location.long, search: placeName })
    updateSearchQuery('')
    updateSearchResults([])
  }

  return <div className="section">
    <div className="container">

      <form className="form" onSubmit={handleSubmit}>

        <div className="field">
          <label className="label">Username</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.username}
              onChange={handleChange}
              name={'username'}
              placeholder="Pick a username"
            />
            {errors.username && <small className="has-text-danger">Invalid username</small>}
          </div>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.email}
              onChange={handleChange}
              name={'email'}
              placeholder="yourname@domain.com" />
            {errors.email && <small className="has-text-danger">Invalid email</small>}
          </div>
        </div>

        <div className='field'>
          <label className='label'>Location</label>
          <div className='control'>
            <input
              className='input'
              placeholder='Start typing your address or postcode'
              type='text'
              value={formData.search || ''}
              onChange={createSearchQuery}
              name={'location'}
              autoComplete="off"
            />
            {errors.location && <small className="has-text-danger">Invalid location</small>}
          </div>
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
          {/* {errors.time && <small className='has-text-danger'>{errors.time.message}</small>} */}
        </div>

        <div className="field">
          <label className="label">About</label>
          <div className="control">
            <textarea
              className="textarea"
              type="text"
              value={formData.bio}
              onChange={handleChange}
              name={'bio'}
              placeholder="Tell us a bit about yourself" />
            {errors.bio && <small className="has-text-danger">Invalid bio</small>}
          </div>
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              className="input"
              type="password"
              value={formData.password}
              onChange={handleChange}
              name={'password'}
              placeholder="Choose a password" />
            {errors.password && <small className="has-text-danger">invalid password</small>}
          </div>
        </div>
        <button className="button color-link-button mt-4">Submit</button>
      </form>
    </div>
  </div>
}