import React from 'react';
import './App.css';
import axios from 'axios';
import logo from './Pizza1.png';

class App extends React.Component{
  state = {
    data: null
  }

  componentDidMount() {
    axios.get('http://localhost:5000')
    .then((response) => {
      this.setState({
        data:response.data
      })
    })
    .catch((error) => {
      console.error(`Error fetching data: ${error}`);
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.state.data}
        </header>
      
      </div>
    );
  }
}

export default App;
