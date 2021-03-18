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

const inputFields = ['name', 'category', 'description', 'image', 'listed']


export default function ItemForm({ formData, handleSubmit, handleChange, updateFormData }) {

  // const [creationSuccess, updateCreationSuccess] = useState(false)
  const [searchQuery, updateSearchQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])

  useEffect(() => {
    debouncedSave(searchQuery, updateSearchResults)
  }, [searchQuery])

  function createSearchQuery(event) {
    updateSearchQuery(event.target.value)
    updateFormData({ ...formData, search: event.target.value })
  }

  function handlePlaceSelect({ placeName, location }) {
    updateFormData({ ...formData, address: placeName, lat: location.lat, lng: location.long, search: placeName })
    updateSearchQuery('')
    updateSearchResults([])
  }

  return <div className="section">
    <div className="container">

      <form className="form update-form" onSubmit={handleSubmit}>

        <div className="field">
          <label className="label">Item Name</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.name}
              onChange={handleChange}
              name={'name'} />
          </div>
        </div>

        <div className="field"></div>
        <label className="label">Type of Item</label>
        <div className="control">
          <div className="select">
            <select
              value={formData.typeof}
              onChange={handleChange}
              name={'typeof'} >

              <option>Goods</option>
              <option>Service</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label">Category</label>
          <div className="control">
            <div className="select">
              <select
                value={formData.category}
                onChange={handleChange}
                name={'category'} >

                <option>Children</option>
                <option>Clothing</option>
                <option>Food And Drink</option>
                <option>Entertainment</option>
                <option>Home And Garden</option>
                <option>Motors</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="field">
          <label className="label">Description</label>
          <div className="control">
            <textarea
              className="textarea"
              type="text"
              value={formData.description}
              onChange={handleChange}
              name={'description'} />
          </div>
        </div>

        <div className="field">
          <label className="label">Image</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={formData.image}
              onChange={handleChange}
              name={'image'} />
          </div>
        </div>

        <button className="button">Submit</button>
      </form >
    </div >
  </div >
}



//  <div className="control">
//   <div className="select">
//     <select>
//       <option>Goods</option>
//       <option>Service</option>
//     </select>
//   </div>
// </div> 











// return <div className="section">
//   <div className="container">
//     <form onSubmit={handleSubmit}>
//       {inputFields.map(field => {
//         return <div key={field} className="field">
//           <label className="label">
//             {field[0].toUpperCase() + field.slice(1)}
//           </label>
//           <div className="control">
//             <input
//               className="input"
//               type="text"
//               value={formData[field]}
//               onChange={handleChange}
//               name={field}
//             />
//           </div>
//         </div>
//       })}
//       {/* ---------------- James ----------------- */}
//       <div className='field'>
//         <label className='label'>Your Location</label>
//         <div className='control'>
//           <input
//             className='input'
//             placeholder='Search...'
//             type='text'
//             value={formData.search || ''}
//             onChange={createSearchQuery}
//             name={'search'}
//           />
//         </div>
//         {searchResults.length > 0 &&
//           <div className='dropdown is-active is-fullwidth'>
//             <div className='dropdown-menu'>
//               <div className='dropdown-content'>
//                 {searchResults.map((place) => {
//                   return <div key={place.id}>
//                     <div className='dropdown-item' id='cardHover' onClick={() => handlePlaceSelect(place)}>{place.placeName}</div>
//                     <hr className="dropdown-divider"></hr></div>
//                 })}
//               </div>
//             </div>
//           </div>}
//       </div>
//       <button className="button mt-5 is-success">Submit</button>
//     </form>
//   </div>
// </div>



{/* <div className="field">
<label className="label">typeof</label>
<div className="control">
  <div className="select">
    <select
    <option> 'Goods' </option>
    <option> 'Service' </option>

      className="select"
      type="text"
      value={formData.typeof}
      onChange={handleChange}
      name={'typeof'} />

  </div>
</div>
</div> */}