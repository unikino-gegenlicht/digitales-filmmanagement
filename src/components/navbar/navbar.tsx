import React, {Fragment} from 'react';
import {Button, Columns, Image, Navbar} from "react-bulma-components";
import {Component} from "react";
import {AuthContextProps, withAuth} from "react-oidc-context";
import ColoredLink from "./coloredLink";

class Navigation extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            menuOpen: false
        }
    }

    render() {
        // get the current user
        let auth = this.props?.auth;
        let user = auth.user
        return (
            <Navbar color={"dark"} active={this.state.menuOpen}>
                <Navbar.Brand>
                    <Navbar.Item>
                        <img src={"/images/logo.svg"} height={28} alt={"App Logo"}/>
                    </Navbar.Item>
                    <Navbar.Burger onClick={() => this.setState({menuOpen: !this.state.menuOpen})}/>
                </Navbar.Brand>
                <Navbar.Menu className={"has-background-dark has-text-centered"}>
                    <Navbar.Container align={"left"}>
                        <Navbar.Item renderAs={"div"} textAlign={"center"} className={"is-hidden-desktop"}>
                            <div className="columns is-mobile">
                                <div className="column is-2">
                                    <figure className="image m-0 is-flex is-fullwidth">
                                        <img className="is-rounded is-flex" style={{maxHeight: "fit-content"}} src={auth.user?.profile.picture}/>
                                    </figure>
                                </div>
                                <div className="column">
                                    <p className="has-text-left has-text-white">
                                        <span className="has-text-weight-bold has-text-white">{auth.user?.profile.name}</span>
                                        <span className={"mx-1"}>&ndash;</span>
                                        {auth.user?.profile.preferred_username}
                                    </p>
                                    <Button onClick={auth.signoutRedirect} fullwidth size={"small"} type={"button"} color={"danger"}>Logout</Button>
                                </div>
                            </div>
                            <hr className={"m-0"}/>
                        </Navbar.Item>
                        <Navbar.Item>
                            <ColoredLink to={'/'}>Home</ColoredLink>
                        </Navbar.Item>
                        <Navbar.Item>
                            <ColoredLink to={'/cashRegister'}>Kasse</ColoredLink>
                        </Navbar.Item>
                    </Navbar.Container>
                    <Navbar.Container align={"right"}>
                        <Navbar.Item renderAs={"div"} className={"is-hidden-touch"}>
                            <div className={"dropdown is-right is-hoverable"}>
                                <div className={"dropdown-trigger"}>
                                    <div className={"buttons"}>
                                        <div className={"button is-rounded"} style={{backgroundImage: "url(" + auth.user?.profile.picture + ")",
                                            backgroundSize: "cover"}}></div>
                                    </div>
                                </div>
                                <div className={"dropdown-menu"}>
                                    <div className={"dropdown-content"}>
                                        <div className={"dropdown-item"}>
                                            <div className={"is-block has-text-centered"}>
                                                <p className={"has-text-weight-bold is-size-6 mb-0"}>{auth.user?.profile.name}</p>
                                                <p>{auth.user?.profile.preferred_username}</p>
                                            </div>
                                        </div>

                                        <div className={"dropwdown-divider has-background-grey-light m-2"} style={{height: "2px"}}></div>
                                        <div className={"dropdown-item"}>
                                            <Button onClick={auth.signoutRedirect} fullwidth size={"small"} type={"button"} color={"danger"}>Logout</Button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </Navbar.Item>
                    </Navbar.Container>
                </Navbar.Menu>
            </Navbar>
        );
    }
}

export default withAuth(Navigation);