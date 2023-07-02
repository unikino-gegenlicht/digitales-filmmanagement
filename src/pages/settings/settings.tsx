import {Component} from "react";
import {Button, Card, Heading, Table, Tabs} from "react-bulma-components";
import {PageState, SettingsPage} from "./types";
import {TailSpin} from "react-loader-spinner";
import colors from "../../_colors.module.scss";
import axios from "axios";
import * as bulmaToast from "bulma-toast";
import {Icon} from "@iconify/react";
import {Article} from "../register/types";

class Settings extends Component<any, PageState> {

    constructor(props: any) {
        super(props);
        this.state = {
            // FIXME: used to build loaders first
            callingAPI: true,
            currentSettingsPage: SettingsPage.REGISTER,
        }
    }

    deleteServerSideArticle(article: Article) {
        console.log("trying to remove article", article)
        // get the list of to be deleted articles
        let currentItemList = this.state.serverSideItems
        let deletedItemList = this.state.deletedArticles
        if (!currentItemList) {
            console.log("unable to remove item from empty list")
            return
        }
        let itemInCurrentList = currentItemList.some((currentArticle) => currentArticle.id === article.id)
        if (!itemInCurrentList) {
            console.warn("unable to remove item from server which is not stored there")
            return;
        }
        if (!deletedItemList) {
            deletedItemList = []
        }
        let itemAlreadyInDeleteList = deletedItemList.some((deletedArticle) => deletedArticle.id === article.id)
        if (itemAlreadyInDeleteList) {
            console.warn("can't delete article twice")
            return;
        }
        deletedItemList.push(article)
        this.setState({deletedArticles: deletedItemList})
    }

    restoreServerSideArticle(article: Article) {
        console.log("trying to remove article", article)
        // get the list of to be deleted articles
        let currentItemList = this.state.serverSideItems
        let deletedItemList = this.state.deletedArticles
        if (!currentItemList) {
            console.log("unable to remove item from empty list")
            return
        }
        let itemInCurrentList = currentItemList.some((currentArticle) => currentArticle.id === article.id)
        if (!itemInCurrentList) {
            console.warn("unable to restore item from server which is not stored there")
            return;
        }
        if (!deletedItemList) {
            deletedItemList = []
        }
        let itemAlreadyInDeleteList = deletedItemList.some((deletedArticle) => deletedArticle.id === article.id)
        if (itemAlreadyInDeleteList) {
            let idx = -1
            for (let i = 0; i < deletedItemList.length; i++) {
                if (article.id === deletedItemList[i].id) {
                    idx = i
                }
            }
            if (idx !== -1) {
                deletedItemList.splice(idx, 1)
                this.setState({deletedArticles: deletedItemList})
            }
        }
    }

    componentDidMount() {
        // download the server side items if it didn't already happen
        if (this.state.serverSideItems === undefined) {
            console.log("loading server side articles")
            axios
                .get("/api/registerItems")
                .then(res => {
                    switch (res.status) {
                        case 200:
                            console.log("successfully loaded server side articles")
                            this.setState({serverSideItems: res.data})
                            break
                        case 204:
                            console.log("no server side articles set")
                            this.setState({serverSideItems: null})
                            break
                        default:
                            console.error("unexpected response code")
                            bulmaToast.toast({
                                message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Artikel</span><br/><span class="subtitle is-5">${res.statusText}</span></p>`,
                                type: 'is-warning',
                                dismissible: false,
                                position: "top-right",
                                single: true,
                                duration: 3000,
                                animate: {in: 'zoomIn', out: 'zoomOut'},
                            })

                    }
                })
                .catch(reason => {
                    console.error(reason)
                    bulmaToast.toast({
                        message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Artikel</span><br/><span class="subtitle is-5">${reason}</span><br/>Es können nur benutzerdefinierte Artikel hinzugefügt werden</p>`,
                        type: 'is-warning',
                        dismissible: false,
                        position: "top-right",
                        single: false,
                        duration: 10000,
                        animate: {in: 'zoomIn', out: 'zoomOut'},
                    })
                    this.setState({serverSideItems: null})
                })
        }
        this.setState({callingAPI: false})

    }

    render() {
        let tableCellStyle = {verticalAlign: "middle"}
        return (
            <div>
                <Button fullwidth color={"warning"} onClick={() => this.setState({callingAPI: !this.state.callingAPI})}>Simulate
                    API Call</Button>
                <div className={"mt-1 px-1"}>
                    <Heading size={3} textAlign={"center"}>Einstellungen</Heading>
                </div>
                <Tabs fullwidth type={"boxed"} align={"center"} mt={2}>
                    <Tabs.Tab active={this.state.currentSettingsPage === SettingsPage.REGISTER} onClick={() => {
                        this.setState({currentSettingsPage: SettingsPage.REGISTER})
                    }}>
                        Kasse
                    </Tabs.Tab>
                    <Tabs.Tab active={this.state.currentSettingsPage === SettingsPage.DATABASE} onClick={() => {
                        this.setState({currentSettingsPage: SettingsPage.DATABASE})
                    }}>
                        Datenbank
                    </Tabs.Tab>
                </Tabs>
                <div className={"px-2"}
                     hidden={!(this.state.currentSettingsPage === SettingsPage.REGISTER)}>
                    <Card>
                        <Card.Header backgroundColor={"white-ter"}>
                            <Card.Header.Title className={"is-centered"}>
                                Verfügbare Artikel
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Content>
                            <p>
                                In diesem Bereich können die auf dem Server
                                gespeicherten Artikel verwaltet werden. Ein
                                passendes Icon für einen Artikel kann auf der
                                folgenden Website gefunden werden: <a
                                href={"https://icon-sets.iconify.design/"}>https://icon-sets.iconify.design/</a>
                            </p>
                            <p>
                                Von dieser muss anschließend der vollständige
                                Name des Icons kopiert werden und als
                                Icon Name eingefügt werden. Eine Voransicht wird
                                das ausgewählte Icon anzeigen
                            </p>
                            <hr/>
                            <div hidden={!this.state.callingAPI}>
                                <TailSpin
                                    height="80"
                                    width="80"
                                    ariaLabel="tail-spin-loading"
                                    radius="1"
                                    color={colors.primary}
                                    wrapperStyle={{}}
                                    wrapperClass="is-justify-content-center"
                                    visible={this.state.callingAPI}
                                />
                                <p className={"subtitle has-text-centered"}>Daten werden geladen</p>
                            </div>
                            <div className={"table-container"}>
                                <Table size={"fullwidth"} hoverable className={"is-narrow"}
                                       hidden={this.state.callingAPI}>
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Bezeichnung</th>
                                        <th>Icon</th>
                                        <th>Preis</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.serverSideItems?.map((article) => {
                                            console.log("rendering server side article", article)
                                            return (
                                                <tr>
                                                    <td style={tableCellStyle}>
                                                        <span className={"icon-text is-align-items-center"}>
                                                        <span className={"is-family-code"}>{article.id}</span>
                                                        <span className={"icon is-small"}>
                                                            <Icon icon={"material-symbols:circle"} height={16}
                                                                  color={colors.success}/>
                                                        </span>
                                                            {
                                                                this.state.deletedArticles?.map((deletedArticle) => {
                                                                        if (deletedArticle.id === article.id) {
                                                                            return (
                                                                                <span className={"icon is-small"}>
                                                                                    <Icon icon={"material-symbols:circle"} height={16} color={colors.danger}/>
                                                                                </span>
                                                                            )
                                                                        }
                                                                        return <span></span>;
                                                                    }
                                                                )
                                                            }
                                                    </span>

                                                    </td>
                                                    <td style={tableCellStyle}>{article.name}</td>
                                                    <td style={tableCellStyle}>
                                                    <span className={"icon-text is-align-items-center"}>
                                                        <span className={"is-family-code"}>{article.icon}</span>
                                                        <span className={"icon is-medium"}>
                                                            <Icon icon={article.icon} height={48}/>
                                                        </span>
                                                    </span>
                                                    </td>
                                                    <td style={tableCellStyle}>{article.price.toFixed(2)} €</td>
                                                    <td style={tableCellStyle}>
                                                        <div className={"buttons"}>
                                                            <Button color={"info"}>
                                                                <Icon icon={"material-symbols:edit-sharp"}/>
                                                            </Button>
                                                            {
                                                                (() => {
                                                                    if (!this.state.deletedArticles) {
                                                                        console.log("no deleted articles yet")
                                                                        return <Button
                                                                            onClick={() => this.deleteServerSideArticle(article)}
                                                                            color={"danger"}><Icon
                                                                            icon={"material-symbols:delete"}/></Button>
                                                                    }
                                                                    if (this.state.deletedArticles.some((a) => a.id === article.id)) {
                                                                        console.log("found deleted article", article)
                                                                        return <Button
                                                                            onClick={() => this.restoreServerSideArticle(article)}
                                                                            color={"warning"}><Icon
                                                                            icon={"material-symbols:undo"}/></Button>
                                                                    } else {
                                                                        return <Button
                                                                            onClick={() => this.deleteServerSideArticle(article)}
                                                                            color={"danger"}><Icon
                                                                            icon={"material-symbols:delete"}/></Button>
                                                                    }
                                                                })()
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    {
                                        this.state.localItems?.map((article) => {
                                            console.log("rendering local article", article)
                                            return (
                                                <tr>
                                                    <td style={tableCellStyle}>{article.id}</td>
                                                    <td style={tableCellStyle}>{article.name}</td>
                                                    <td style={tableCellStyle}>
                                                    <span className={"icon-text is-align-content-center"}>
                                                        <span>{article.icon}</span>
                                                        <span className={"icon is-large"}>
                                                            <Icon icon={article.icon} height={48}/>
                                                        </span>
                                                    </span>
                                                    </td>
                                                    <td style={tableCellStyle}>{article.price}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Content>
                        <Card.Footer alignContent={"end"}>
                            <Card.Footer.Item>
                                <div className={"buttons"}>
                                    <Button color={"warning"}>Änderungen verwerfen</Button>
                                    <Button color={"success"}>Änderungen speichern</Button>
                                </div>
                            </Card.Footer.Item>
                        </Card.Footer>
                    </Card>
                </div>
            </div>);
    }
}

export default Settings;