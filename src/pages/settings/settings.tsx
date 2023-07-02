import {Component} from "react";
import Navbar from "../../components/navbar/navbar";
import {Card} from "react-bulma-components";

class SettingsPage extends Component<any, any> {

    showSettings(pageID: string) {

    }

    render() {
        return (<div>
            <Navbar/>
            <h1 className={"title has-text-centered"}>Einstellungen</h1>
            <Card id={"registerSettings"}>
                <Card.Header>
                    <p className={"card-header-title"}>
                        Artikel im Verkauf
                    </p>
                </Card.Header>
                <Card.Content>

                </Card.Content>
            </Card>
        </div>);
    }
}

export default SettingsPage;