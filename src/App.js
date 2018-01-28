/**
 * {App} React Component to display Home Page
 * @dependency {Material UI} for Layout Display
 * {React-Icons} To implement icons in GUI
 */

import React, { Component } from "react";
import Autocomplete from "material-ui/AutoComplete";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import FaIconAsc from "react-icons/lib/fa/sort-amount-asc";
import FaIconDsc from "react-icons/lib/fa/sort-amount-desc";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import gif from "./2.gif";
import InfiniteScroll from "react-infinite-scroller";
import "./App.css";
var store = require("store");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      location: [],
      title: [],
      filters: { search: "", locations: [] },
      sortPreference: "percentageAsc",
      results: [],
      hasMore: false,
      page: 0
    };
  }

  //@{function} To open drawer
  handleOpen = () => {
    this.setState({ open: true });
  };

  //@{function} To close drawer
  handleClose = () => {
    this.setState({ open: false });
  };

  componentWillMount() {
    let sortPreference = store.get("sortPreference") || "percentageAsc";
    let location = JSON.parse(store.get("locationPreference") || '[]') || [];

    this.setState({
      sortPreference,
      filters: {
        ...this.state.filters,
        ...{ locations: location }
      }
    });

    fetch("http://starlord.hackerearth.com/kickstarter")
      .then(res => {
        return res.json();
      })
      // .then(res => {
      //   console.log(res);
      //   this.setState({ data: res });
      // })
      .then(res => {
        this.setState({
          data: res,
          title: Object.keys(
            res
              .map(data => {
                return data.title;
              })
              .reduce((a, b) => {
                a[b] = 0;
                return a;
              }, {})
          ),
          location: Object.keys(
            res
              .map(data => {
                return data.location;
              })
              .reduce((a, b) => {
                a[b] = 0;
                return a;
              }, {})
          )
        });
        this.setResults();
        this.setState({ hasMore: true, page: 0 });
      });
  }

  //@{function} function to handle search
  handleSearch(e) {
    this.setState({
      page: 0,
      filters: {
        ...this.state.filters,
        ...{ search: e }
      }
    }, () => this.setResults());
    console.log(e);
  }

  //@{function} function to handle Sorting
  handleSort(str) {
    this.setState({ sortPreference: str, page: 0 },() => this.setResults());
    store.set("sortPreference", JSON.stringify(str));
  }

  //@{function} function to Sort Percentage in Ascending Order
  percentageSortAsc(results = []) {
    var percentageList = results.sort((a, b) => {
      return a["percentage.funded"] - b["percentage.funded"];
    });
    return percentageList;
    // this.setState({ data: percentageList });
  }

  //@{function} function to Sort Percentage in Descending Order
  percentageSortDesc(results = []) {
    var percentageList = results.sort((a, b) => {
      return b["percentage.funded"] - a["percentage.funded"];
    });
    return percentageList;
  }

  //@{function} function to Sort End Time in Ascending Order
  timeAsc(results = []) {
    var timeList = results.sort((a, b) => {
      return new Date(b["end.time"]) < new Date(a["end.time"]) ? -1 : 1;
    });
    return timeList;
  }

  //@{function} function to Sort End Time in Descending Order
  timeDsc(results = []) {
    var timeList = results.sort((a, b) => {
      return new Date(b["end.time"]) > new Date(a["end.time"]) ? -1 : 1;
    });
    return timeList;
  }

  loadItems(page) {
    this.setState({ page, hasMore : false }, () => this.setResults());
    
  }
  /**
   * @{setResults} function to return result according to Sort and Search
   */
  setResults() {
    let results = [...this.state.data];
    let locationFilters = this.state.filters.locations;
    let searchFilter = this.state.filters.search;
    results =
      searchFilter.length === 0
        ? results
        : results.filter(result =>
            result.title.toLowerCase().includes(searchFilter.toLowerCase())
          );
    results =
      locationFilters.length === 0
        ? results
        : results.filter(
            result => locationFilters.indexOf(result.location) >= 0
          );
    switch (this.state.sortPreference) {
      case "percentageAsc":
        results = this.percentageSortAsc(results);
        break;
      case "percentageDsc":
        results = this.percentageSortDesc(results);
        break;
      case "timeAsc":
        results = this.timeAsc(results);
        break;
      case "timeDsc":
        results = this.timeDsc(results);
        break;
      default:
        results = this.percentageSortAsc(results);
        break;
    }
    var hasMore = false;
    if ((this.state.page + 1) * 10 < results.length) {
      hasMore = true;
    }
    results = [
      ...results.slice(0, Math.min((this.state.page + 1) * 10, results.length))
    ];
    this.setState({ results, hasMore });
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  filteredData(e) {
    let locationFilters = [...this.state.filters.locations];
    let currentValue = e.target.value;
    let isActive = e.target.checked;
    let index = locationFilters.indexOf(currentValue);
    locationFilters =
      index < 0 && isActive === true
        ? [...locationFilters, currentValue]
        : [
            ...locationFilters.slice(0, index),
            ...locationFilters.slice(index + 1)
          ];
    console.log(locationFilters);
    this.setState({
      page: 0,
      filters: {
        ...this.state.filters,
        ...{ locations: locationFilters }
      }
    }, () => this.setResults());
    store.set("locationPreference", JSON.stringify(locationFilters));
    }

  render() {
    var kickstarter = this.state.results.map((data, key) => {
      return (
        <div key={key} className="dataStyle">
          <div>
            TITLE: <div className="titleDataStyle">{data.title}</div>
          </div>
          <div>
            BLURB: <div className="titleDataStyle">{data.blurb}</div>
          </div>
          <div>
            BY: <div className="titleDataStyle">{data.by}</div>
          </div>
          <div>
            TYPE:
            <div className="titleDataStyle">{data.type}</div>
          </div>
          <div>
            LOCATION:
            <div className="titleDataStyle">{data.location}</div>
          </div>
          <div>
            STATE:
            <div className="titleDataStyle">{data.state}</div>
          </div>
          <div>
            COUNTRY: <div className="titleDataStyle">{data.country}</div>
          </div>

          <div>
            CURRENCY:
            <div className="titleDataStyle">{data.currency}</div>
          </div>

          <div>
            AMOUNT PLEDGED:
            <div className="titleDataStyle">{data["amt.pledged"]}</div>
          </div>
          <div>
            NUMBER BACKERS:
            <div className="titleDataStyle">{data["num.backers"]}</div>
          </div>
          <div>
            PERCENTAGE FUNDED:
            <div className="titleDataStyle">{data["percentage.funded"]}</div>
          </div>
          <div>
            END TIME:
            <div className="titleDataStyle">{data["end.time"]}</div>
          </div>
          <div>
            URL:
            <div className="titleDataStyle" P>
              <a href={`https://www.kickstarter.com${data.url}`} target="blank">
                Click Me
              </a>
            </div>
          </div>
        </div>
      );
    });

    var filterCheckBox = this.state.location.map((loc, key) => {
      return (
        <div key={key} className="form-group checkStyle">
          <input
            type="checkbox"
            name="location"
            checked={this.state.filters.locations.indexOf(loc) >= 0}
            value={loc}
            onChange={e => this.filteredData.call(this, e)}
          />
          &nbsp;&nbsp;{loc}
        </div>
      );
    });

    return (
      <div className="container-fluid bodyStyle">
        <div className="row">
          <div className="col-md-12">
            <div>
              <nav className="navbar navbar-light bg-faded navStyle">
                <form className="form-inline formStyle">
                  <MuiThemeProvider>
                    <Autocomplete
                      floatingLabelText="Search..."
                      openOnFocus={true}
                      dataSource={this.state.title}
                      fullWidth={true}
                      onNewRequest={value =>
                        this.handleSearch.call(this, value)
                      }
                      onUpdateInput={value =>
                        this.handleSearch.call(this, value)
                      }
                      filter={(searchText, key) => true}
                      listStyle={{
                        maxHeight: 400,
                        overflow: "scroll",
                        cursor: "pointer",
                        fontFamily: "Segoe UI",
                        zIndex: 10000,
                        overflowX: "scroll",
                        color: "black"
                      }}
                    />
                    <RaisedButton
                      primary={true}
                      label="Location Filter"
                      onClick={this.handleToggle}
                    />
                    <Drawer
                      docked={false}
                      width={300}
                      open={this.state.open}
                      onRequestChange={open => this.setState({ open })}
                    >
                      <MenuItem>{filterCheckBox}</MenuItem>
                    </Drawer>
                  </MuiThemeProvider>
                  <span className="buttonStyle">Sort by: </span>
                  <button
                    className="btn btn-outline-success buttonStyle"
                    type="button"
                    onClick={() => this.handleSort.call(this, "percentageAsc")}
                  >
                    Percentage <FaIconAsc />
                  </button>

                  <button
                    className="btn btn-outline-success buttonStyle"
                    type="button"
                    onClick={() => this.handleSort.call(this, "percentageDsc")}
                  >
                    Percentage <FaIconDsc />
                  </button>

                  <button
                    className="btn btn-outline-success buttonStyle"
                    type="button"
                    onClick={() => this.handleSort.call(this, "timeAsc")}
                  >
                    End Time <FaIconAsc />
                  </button>

                  <button
                    className="btn btn-outline-success buttonStyle"
                    type="button"
                    onClick={() => this.handleSort.call(this, "timeDsc")}
                  >
                    End Time <FaIconDsc />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary buttonStyle"
                    data-toggle="modal"
                    data-target="#exampleModal"
                  >
                    Portfolio
                  </button>
                  <div
                    className="modal fade"
                    id="exampleModal"
                    // tabindex="-1"
                    role="dialog"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog" role="document">
                      <div className="modal-content bodyStyle">
                        <div className="modal-header">
                          <button
                            className="btn btn-success"
                            id="exampleModalLabel"
                          >
                            Portfolio
                          </button>
                          <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <div className="container-fluid">
                            <div className="row">
                              <div className="col-md-8">
                                <p>
                                  &#x2705;&nbsp;&nbsp; Designed and Implemented MovieListing Website using React
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Designed and Implemented musicMaster Website using React{" "}
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Used MongoDB for storing data in Database with Node
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Designed Graph using react-chartjs-2
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Designed GUI using Material-UI and Bootstrap
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Used Express for Server Side Rendering
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Implemented Infinite Scroll Pagination using react-infinite-scroller
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Implemented Common GUI functionality like Sorting, Searching, Filtering, Routing
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Used Subtle pattern for beautify Application
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Commit the code in Github
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Deployed the code in Heroku Server
                                </p>
                                <p>
                                  &#x2705;&nbsp;&nbsp; Ranked 109 in Hackerearth Code Arena
                                </p>
                              </div>
                              <div className="col-md-4 imgStyle">
                                <img src={gif} height="150" width="150" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </nav>
            </div>
            <div>
              <InfiniteScroll
                pageStart={0}
                loadMore={this.loadItems.bind(this)}
                hasMore={this.state.hasMore}
                loader={
                  <div className="loader" key={0}>
                    Loading ...
                  </div>
                }
              >
                <div className="tracks">{kickstarter}</div>
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
