import React from 'react'

import Header from './Header'
import TopMenu from './TopMenu'
import Features from './Features'
import ExploreArea from './ExploreArea'
import HowToMakeMenu from './HowToMakeMenu'
import AddYourRestaurant from './AddYourRestaurant'

const Home = () => {
  return (
    <>
      <Header />
      <TopMenu />
      <Features />
      <ExploreArea/>
      <HowToMakeMenu/>
      <AddYourRestaurant/>
    </>
  )
}

export default Home