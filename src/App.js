import React, { Component } from 'react';

import { GET_DATA_URI } from './env';
import { radOptions, rad2Options, cidOptions } from "./constants";
import './App.css';

class App extends Component {

  state = {
    rad: 100,
    rad2: 'mi',
    rad3: 33323,
    cid: 3,
    listings: [],
  };

  async componentDidMount() {
    const { rad, rad2, rad3, cid } = this.state;
    const result = await fetch(`${GET_DATA_URI}?rad=${rad}&rad2=${rad2}&rad3=${rad3}&cid=${cid}`)
    const listings = await result.json();
    this.setState({ listings });
  }

  render() {
    const { rad, rad2, rad3, cid, listings } = this.state;
    return (
      <div className="App">
        <form>
          <label htmlFor="rad">Search for:&nbsp;</label>
          <select name="rad" value={rad}>
            {radOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <label htmlFor="rad2"></label>
          <select name="rad2" value={rad2}>
            {rad2Options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <label htmlFor="rad3">from:&nbsp;</label>
          <input type="text" name="rad3" value={rad3} />
          <label htmlFor="cid"></label>
          <select name="cid" value={cid}>
            <option value="">Select a Category...</option>
            {cidOptions.map(({ value, text }) => <option key={value} value={value}>{text}</option>)}
          </select>
        </form>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Owner</th>
              <th>Address</th>
              <th>Website</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, i) => (
              <tr key={i}>
                <td><a href={listing.companyURI}>{listing.companyName}</a></td>
                <td>{listing.owner}</td>
                <td>{listing.address}</td>
                <td>{listing.website}</td>
                <td>{listing.phone}</td>
                <td>{listing.email}</td>
                <td>{listing.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
