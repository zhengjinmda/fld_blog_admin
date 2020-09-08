import React, { useState } from 'react'

import { BrowserRouter as Router, Route } from 'react-router-dom'
import Login from './Login'
import AdminIndex from './AdminIndex'
import '../static/css/comm.css'


function Main() {
    return(
        <Router>
            <Route exact path='/' exact  component={Login}></Route>
            <Route path='/index/' component={AdminIndex}></Route>
        </Router>
    )
}

export default Main