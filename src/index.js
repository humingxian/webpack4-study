import React, { Component } from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Home from './home'
import About from './about'
// const About = require('')
// const About = () => require('./about')

class App extends Component {
  componentDidMount () {
    axios.get('/react/api/header.json').then(res => {
      console.log(res.data)
    })
  }

  render () {
    return (<Router>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
    )
  }
}

ReactDom.render(<App/>, document.getElementById('root'))

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(registration => {
//         console.log("SW registered.")
//       })
//       .catch(registrationError => {
//         console.log("SW registration failed.");
//       });
//   });
// }
