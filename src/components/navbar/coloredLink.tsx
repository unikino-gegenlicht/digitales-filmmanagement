import {Link, LinkProps} from "react-router-dom";
import {Component} from "react";

class ColoredLink extends Component<LinkProps, any> {
    render() {
        const location = window.location
        return (<Link {...this.props} {...(location.pathname === this.props.to.toString() ? {className: "has-text-primary"} : {className: "has-text-white"})}>{this.props.children}</Link>);
    }
}

export default ColoredLink;