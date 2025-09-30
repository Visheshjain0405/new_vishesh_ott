import React from 'react'
import Navbar from '../Components/Navbar'
import MovieSlider from '../Components/MovieSlider'
import MovieCategory from './MovieCategory'

function HomePage() {
  return (
    <div>
        {/* <Navbar/> */}
        <MovieSlider/>
        <MovieCategory/>
    </div>
  )
}

export default HomePage