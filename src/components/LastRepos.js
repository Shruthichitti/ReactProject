import React, { Component, Fragment } from "react";
import request from "superagent";

class LastRepos extends Component {
  constructor(props) {
    super(props);
    
    // Sets up our initial state
    this.state = {
      error: false,
      hasMore: true,
      isLoading: false,
      users: [],
      pageNum: 1
    };

    // Binds our scroll event handler
    window.onscroll = () => {
      const {
        state: {
          error,
          isLoading,
          hasMore,
        },
      } = this;

      // Bails early if:
      // * there's an error
      // * it's already loading
      // * there's nothing left to load
      if (error || isLoading || !hasMore) return;

      // Checks that the page has scrolled to the bottom
      if (
        (window.innerHeight + window.scrollY) >= document.body.offsetHeight
      ) {
        this.loadExtraUsers();
      }
    };
  }

  componentDidMount() {
    // Loads some users on initial load
    this.loadUsers();
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  loadUsers = () => {
    this.setState({ isLoading: true }, () => {
      request
        .get('https://api.github.com/search/repositories?q=created:>2020-05-28&sort=stars&order=desc')
        .then((results) => {          
          // Creates a massaged array of user data
          console.log(results);
          const nextUsers = results.body.items.map(repo => ({
            id: repo.id,
            name: repo.owner.login,
            photo: repo.owner.avatar_url,
            description: repo.description,
            stars: repo.stargazers_count,
            issues: repo.open_issues_count
          }));

          // Merges the next users into our existing users
          this.setState({
            hasMore: (this.state.users.length < 1000),
            isLoading: false,
            users: [
              ...this.state.users,
              ...nextUsers,
            ],
          });
        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
           });
        })
    });
  } 

  loadExtraUsers = () => {
    this.setState({ isLoading: true, pageNum: this.state.pageNum + 1 }, () => {
      request
        .get(`https://api.github.com/search/repositories?q=created:>2020-05-28&sort=stars&order=desc&page=${this.state.pageNum}`)
        .then((results) => {          
          // Creates a massaged array of user data
          console.log(results);
          const nextUsers = results.body.items.map(repo => ({
            id: repo.id,
            name: repo.owner.login,
            photo: repo.owner.avatar_url,
            description: repo.description,
            stars: repo.stargazers_count,
            issues: repo.open_issues_count,

          }));

          // Merges the next users into our existing users
          this.setState({
            hasMore: (this.state.users.length < 10000),
            isLoading: false,
            users: [
              ...this.state.users,
              ...nextUsers,
            ],
          });
        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
           });
        })
    });
  } 


  render() {
    const {
      error,
      hasMore,
      isLoading,
      users
    } = this.state;
    if(users){
    return (
      <div>
        {users.map(user => (
          <Fragment key={user.id}>
            <hr />
            <div style={{ display: 'flex' }}>
              <img
                alt={user.name}
                src={user.photo}
                style={{
                  borderRadius: '50%',
                  height: 72,
                  marginRight: 20,
                  width: 72,
                }}
              />
                <div className="content">
                    <h2>{user.name}</h2>
                    <div className="description">
                        <p>{user.description}</p>
                    </div>
                    <div className = "meta">
                        <button style={{margin:'5px'}}>STARS: {user.stars}</button>
                        <button style={{margin:'5px'}}>ISSUES: {user.issues}</button>
                        <span>Submitted 30 days ago by {user.name}</span>
                    </div>
                </div>
            </div>
          </Fragment>
        ))}
        <hr />
        {error &&
          <div style={{ color: '#900' }}>
            {error}
          </div>
        }
        {isLoading &&
          <div>Loading...</div>
        }
        {!hasMore &&
          <div>You did it! You reached the end!</div>
        }
      </div>
    );
    }
  }
}
  
export default LastRepos;

