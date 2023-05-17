import 'bootstrap/dist/css/bootstrap.css';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
//import './App.css';

import { useState } from "react";
import { Container } from 'react-bootstrap';
/*
import VideoBg from "reactjs-videobg";
import FilterBgPoster from "/images/filtering.png";
import FilterBgVideo from "/videos/filtering.webm";

import SearchForm from 'components/SearchForm/SearchForm';
import DragDropList from 'components/DndContainer/DragDropList';
*/
import Root from './Components/Pages/Root';
import Home from 'components/Pages/Home/Home';
import NotFound from 'components/Pages/NotFound/NotFound';
/*
import Navbar from 'components/Pages/Navbar/Navbar';
import About from 'components/Pages/About/About';
import GameDetails from 'components/Pages/GameDetails/GameDetails';
import AddGame from 'components/Pages/AddGame/AddGame';
*/

// NOTE:
//  All icons can be found via https://react-icons.github.io/react-icons

// TODO: Setup SASS and research theme colors
//  from https://getbootstrap.com/docs/5.0/customize/color/#theme-colors

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Root />}>
    <Route index path="/" element={<Home />} errorElement={<p>Something went wrong</p>} />
    <Route path="verify/:verification" element={<Home />}/>
    <Route path="*" element={<NotFound />}/>
  </Route>
));

function App() {
  return (
    <div className='App'>
      {/* <VideoBg poster={FilterBgPoster}>
        <VideoBg.Source src={FilterBgVideo} type="video/webm" />
      </VideoBg> */}

      <RouterProvider router={router} />

      {/* <Container className='shadow-lg d-flex flex-column rounded m-0 p-3 searchform'>
        <DragDropList rowCount="4"/>
      </Container> */}
    </div>
  )
}

export default App;
