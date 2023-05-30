import {Button, Navbar} from "react-bulma-components";
import {Component} from "react";
import {withAuth} from "react-oidc-context";
import ColoredLink from "./coloredLink";

class Navigation extends Component<any, any> {
    render() {
        // get the current user
        let auth = this.props?.auth;
        return (
            <Navbar color={"dark"}>
                <Navbar.Brand>
                    <Navbar.Item>
                        <img src={"/images/logo.svg"} height={28} alt={"App Logo"}/>
                    </Navbar.Item>
                </Navbar.Brand>
                <Navbar.Menu>
                    <Navbar.Container>
                        <Navbar.Item>
                            <ColoredLink to={'/'}>Home</ColoredLink>
                        </Navbar.Item>

                    </Navbar.Container>
                    <Navbar.Container align={"right"}>
                        <Navbar.Item>
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
        )
    }
}

export default withAuth(Navigation);