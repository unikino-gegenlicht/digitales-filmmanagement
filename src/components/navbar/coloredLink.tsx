import {useNavigate} from "react-router-dom";
import {Navbar} from "react-bulma-components";
import {Component} from "react";

class CLink extends Component<any, any> {
    render() {
        const location = window.location
        return (
            <Navbar.Item
                onClick={() => this.props.navigate(this.props.to.toString())}
                {...(location.pathname === this.props.to.toString() ?
                    {className: "has-text-primary"} :
                    {className: "has-text-white"})}>
                {this.props.children}
            </Navbar.Item>);
    }
}

function ColoredLink(props: any) {
    let navigate = useNavigate()
    return <CLink {...props} navigate={navigate}/>
}

export default ColoredLink;