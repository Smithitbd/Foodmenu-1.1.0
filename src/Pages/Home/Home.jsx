import React from 'react'

import Header from './Header'
import TopMenu from './TopMenu'
import Features from './Features'
import ExploreArea from './ExploreArea'
import HowToMakeMenu from './HowToMakeMenu'
import AddYourRestaurant from './AddYourRestaurant'
import OrderTrackerWidget from '../../Components/Button/OrderTrackerSticky'

const Home = () => {
  return (
    <>
      <Header />
      < OrderTrackerWidget/>
      <TopMenu />
      <Features />
      <ExploreArea/>
      <HowToMakeMenu/>
      <AddYourRestaurant/>
    </>
  )
}

export default Home