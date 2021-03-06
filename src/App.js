import React, { Component } from 'react';
import { parse } from 'json2csv';

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
    loading: false,
  };

  async componentDidMount() {
    await this.getListings();
  }

  getListings = async () => {
    this.setState({ loading: true });
    const { rad, rad2, rad3, cid } = this.state;
    const result = await fetch(`${GET_DATA_URI}?rad=${rad}&rad2=${rad2}&rad3=${rad3}&cid=${cid}`)
    const listings = await result.json();
    this.setState({ listings, loading: false });
  };

  handleSubmit = async event => {
    event.preventDefault();
    await this.getListings();
  };

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  handleDownload = () => {
    const { listings } = this.state;
    const fields = [
      { value: 'companyName', label: 'Company' },
      { value: 'owner', label: 'Owner' },
      { value: 'address', label: 'Address' },
      { value: 'website', label: 'Website' },
      { value: 'phone', label: 'Phone' },
      { value: 'fax', label: 'Fax' },
      { value: 'poBox', label: 'P.O. Box' },
      { value: 'email', label: 'Email' },
      { value: 'distance', label: 'Distance' },
    ];
    const data = parse(listings, { fields });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `listings_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  render() {
    const { rad, rad2, rad3, cid, listings, loading } = this.state;
    return (
      <div className="App">
        <form className="form-inline px-3 pt-3" onSubmit={this.handleSubmit}>
          <label className="my-1 mr-2" htmlFor="rad">Search for:&nbsp;</label>
          <select className="form-control my-1 mr-sm-2" name="rad" value={rad} onChange={this.handleChange}>
            {radOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <label className="my-1" htmlFor="rad2"></label>
          <select className="form-control my-1 mr-sm-2" name="rad2" value={rad2} onChange={this.handleChange}>
            {rad2Options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <label className="my-1 mr-2" htmlFor="rad3">from:&nbsp;</label>
          <input className="form-control" type="text" name="rad3" value={rad3} onChange={this.handleChange} />
          <label className="my-1 mx-2" htmlFor="cid">and/or:</label>
          <select className="form-control my-1 mr-sm-2" name="cid" value={cid} onChange={this.handleChange}>
            <option value="">Select a Category...</option>
            {cidOptions.map(({ value, text }) => <option key={value} value={value}>{text}</option>)}
          </select>
          <button type="submit" disabled={!rad3 || !cid} className="btn btn-primary my-1">Search</button>
          <div className="alert alert-info py-1 my-1 mx-2" role="alert">{loading ? 'Searching' : listings.length + ' listings'}</div>
          {listings.length > 0 && <button type="button" className="btn btn-primary my-1 ml-2" onClick={this.handleDownload}>Download CSV</button>}
        </form>
        <div className="table-responsive">
          <table className="table table-sm table-striped table-hover">
            <caption>{listings.length < 1 ? `Sorry. No listings were found matching your search.` : ''}</caption>
            <thead>
              <tr>
                <th scope="col">Company</th>
                <th scope="col">Owner</th>
                <th scope="col">P.O. Box</th>
                <th scope="col">Address</th>
                <th scope="col">Website</th>
                <th scope="col">Phone</th>
                <th scope="col">Fax</th>
                <th scope="col">Email</th>
                <th scope="col">Distance</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, i) => (
                <tr key={i}>
                  <td><a href={listing.companyURI}>{listing.companyName}</a></td>
                  <td>{listing.owner}</td>
                  <td>{listing.poBox}</td>
                  <td>{listing.address}</td>
                  <td>{listing.website}</td>
                  <td>{listing.phone}</td>
                  <td>{listing.fax}</td>
                  <td>{listing.email}</td>
                  <td>{listing.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
