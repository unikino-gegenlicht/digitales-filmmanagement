import {Component, createRef} from "react";
import {Block, Button, Card, Heading, Modal, Table, Tabs} from "react-bulma-components";
import {PageState, SettingsPage} from "./types";
import {TailSpin} from "react-loader-spinner";
import colors from "../../_colors.module.scss";
import axios from "axios";
import * as bulmaToast from "bulma-toast";
import {Icon, IconifyIcon} from "@iconify/react";
import {Article} from "../register/types";

class Settings extends Component<any, PageState> {

    private inputEditItemName: React.RefObject<HTMLInputElement> = createRef()
    private inputEditItemPrice: React.RefObject<HTMLInputElement> = createRef()
    private inputEditItemIcon: React.RefObject<HTMLInputElement> = createRef()
    private editItemIconPreview: React.RefObject<IconifyIcon> = createRef()

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

    editArticle(article: Article) {
        this.setState({currentlyEditedArticle: article, showArticleEditPopup: true})
    }

    saveEditedArticle() {
        let articleNameInput = this.inputEditItemName.current
        let articlePriceInput = this.inputEditItemPrice.current
        let articleIconInput = this.inputEditItemIcon.current
        let currentlyEditedArticle = this.state.currentlyEditedArticle
        if (!currentlyEditedArticle) {
            console.error("no currently edited article")
            return
        }
        if (articleNameInput) {
            currentlyEditedArticle.name = articleNameInput.value
        }
        if (articlePriceInput) {
            if (Number.isNaN(Number.parseFloat(articlePriceInput.value))) {
                articlePriceInput.setCustomValidity("Das ist keine Zahl")
                articlePriceInput.reportValidity()
                return;
            }
            currentlyEditedArticle.price = Number.parseFloat(articlePriceInput.value)
        }
        if (articleIconInput) {
            currentlyEditedArticle.icon = articleIconInput.value
        }
        let editedArticles = this.state.editedArticles
        if (!editedArticles) {
            editedArticles = []
        }
        editedArticles.push(currentlyEditedArticle)
        this.setState({showArticleEditPopup: false, currentlyEditedArticle: undefined, editedArticles: editedArticles})
    }

    handleUpdatedIcon(event: React.ChangeEvent<HTMLInputElement>) {
        let newIconName = event.target.value
        let currentEditedArticle = this.state.currentlyEditedArticle
        if (currentEditedArticle) {
            currentEditedArticle.icon = newIconName
        }
        this.setState({currentlyEditedArticle: currentEditedArticle})
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
                <div className={"px-3"} hidden={!(this.state.currentSettingsPage === SettingsPage.REGISTER)}>
                    <Block>
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
                                        <th></th>
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
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                                                        <span className={"icon-text"}>
                                                            <span className={"is-family-code has-tooltip-arrow has-tooltip-right"} data-tooltip={article.id}>
                                                                {article.id.substring(0,4)}
                                                            </span>
                                                        </span>
                                                    </td>
                                                    <td style={{textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap"}}><Icon icon={"material-symbols:circle"} color={colors.success}/>{
                                                        this.state.deletedArticles?.map((deletedArticle) => {
                                                                if (deletedArticle.id === article.id) {
                                                                    return (
                                                                        <span className={"icon"}>
                                                                            <Icon icon={"material-symbols:circle"}
                                                                                  color={colors.danger}/>
                                                                        </span>
                                                                    )
                                                                }
                                                                return null
                                                            }
                                                        )
                                                    }
                                                    </td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>{article.name}</td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                                                    <span className={"icon is-large has-tooltip-arrow"} data-tooltip={article.icon}>
                                                            <Icon icon={article.icon} height={48}/>
                                                    </span>
                                                    </td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>{article.price.toFixed(2)} €</td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                                                        <div className={"buttons is-centered"}>
                                                            <Button color={"info"} onClick={() => this.editArticle(article)}>
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
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>{article.id}</td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>{article.name}</td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                                                    <span className={"icon-text is-align-content-center"}>
                                                        <span>{article.icon}</span>
                                                        <span className={"icon is-large"}>
                                                            <Icon icon={article.icon} height={48}/>
                                                        </span>
                                                    </span>
                                                    </td>
                                                    <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>{article.price}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                            </div>
                            <Heading size={6}>Legende</Heading>
                            <p>
                                <span className={"icon-text is-align-items-center"}>
                                    <span className={"icon is-small"}>
                                        <Icon icon={"material-symbols:circle"} height={16}
                                              color={colors.success}/>
                                    </span>
                                    <span>Artikel auf Server gespeichert</span>
                                </span>
                            </p>
                            <p>
                                <span className={"icon-text is-align-items-center"}>
                                    <span className={"icon is-small"}>
                                        <Icon icon={"material-symbols:circle"} height={16}
                                              color={colors.danger}/>
                                    </span>
                                    <span>Artikel für Löschung markiert</span>
                                </span>
                            </p>
                            <p>
                                <span className={"icon-text is-align-items-center"}>
                                    <span className={"icon is-small"}>
                                        <Icon icon={"material-symbols:circle"} height={16}
                                              color={colors.info}/>
                                    </span>
                                    <span>Neuer Artikel</span>
                                </span>
                            </p>
                            <p>
                                <span className={"icon-text is-align-items-center"}>
                                    <span className={"icon is-small"}>
                                        <Icon icon={"material-symbols:circle"} height={16}
                                              color={colors.warning}/>
                                    </span>
                                    <span>Artikel bearbeitet</span>
                                </span>
                            </p>
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
                    </Block>
                    <Block>
                        <Card>
                            <Card.Header backgroundColor={"white-ter"}>
                                <Card.Header.Title className={"is-centered"}>
                                    Kassen
                                </Card.Header.Title>
                            </Card.Header>
                        </Card>
                    </Block>
                </div>
                <Modal show={this.state.showArticleEditPopup} closeOnBlur={true} closeOnEsc={true} onClose={() => this.saveEditedArticle()}>
                    <Modal.Card>
                        <Modal.Card.Header>
                            <Modal.Card.Title textAlign={"center"}>
                                Artikel bearbeiten
                            </Modal.Card.Title>
                        </Modal.Card.Header>
                        <Modal.Card.Body>
                            <div className={"field"}>
                                <label className={"label"}>Bezeichnung</label>
                                <div className={"control"}>
                                    <input ref={this.inputEditItemName} className={"input"} type={"text"} defaultValue={this.state.currentlyEditedArticle?.name}/>
                                </div>
                            </div>
                            <div className={"field"}>
                                <label className={"label"}>Preis</label>
                                <p className={"control has-icons-right"}>
                                    <input ref={this.inputEditItemPrice} className={"input"} type={"number"} step={0.01} min={0.00} defaultValue={this.state.currentlyEditedArticle?.price.toFixed(2)}/>
                                    <span className={"icon is-small is-right"}>
                                        <Icon icon={"ic:outline-euro"}/>
                                    </span>
                                </p>
                            </div>
                            <div className={"field"}>
                                <label className={"label"}>Icon</label>
                                <div className={"control"}>
                                    <input ref={this.inputEditItemIcon} className={"input"} type={"text"} defaultValue={this.state.currentlyEditedArticle?.icon} onChange={(event) => this.handleUpdatedIcon(event)}/>
                                </div>
                            </div>
                            <div className={"field"}>
                                <label className={"label"}>Vorschau des Icons</label>
                                <div className={"control has-text-centered"}>
                                    <Icon icon={(this.state.currentlyEditedArticle ? this.state.currentlyEditedArticle.icon : "")} height={128}/>
                                </div>
                            </div>
                        </Modal.Card.Body>
                        <Modal.Card.Footer renderAs={Button.Group} align={"right"}>
                            <Button color={"warning"} onClick={() => this.setState({currentlyEditedArticle: undefined, showArticleEditPopup: false})}>Abbrechen</Button>
                            <Button color={"success"} onClick={() => this.saveEditedArticle()}>Speichern</Button>
                        </Modal.Card.Footer>
                    </Modal.Card>
                </Modal>
            </div>
        );
    }
}

export default Settings;