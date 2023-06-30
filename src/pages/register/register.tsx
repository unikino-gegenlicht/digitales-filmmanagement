import {Component, createRef} from "react";
import {Article, PageState, RegisterTransaction} from "./types";
import axios from "axios";
import * as bulmaToast from "bulma-toast";
import {Navigate} from "react-router-dom";
import {AuthContextProps, withAuth} from "react-oidc-context";
import {Box, Button, Columns, Heading, Modal} from "react-bulma-components";
import {Icon} from "@iconify/react";


class Register extends Component<any, PageState> {

    /**
     * references the input field used to set the name of the custom item
     *
     * @type React.RefObject<HTMLInputElement>
     * @private
     */
    private customArticleNameInput: React.RefObject<HTMLInputElement> = createRef();

    /**
     * references the input field used to set the price of the custom item
     *
     * @type React.RefObject<HTMLInputElement>
     * @private
     */
    private customArticlePriceInput: React.RefObject<HTMLInputElement> = createRef();

    constructor(props: any) {
        super(props);
        this.state = {currentTotal: 0.00}
    }

    componentDidMount() {
        if (!this.state.availableRegisters) {
            axios
                .get("/api/register")
                .then(res => {
                    switch (res.status) {
                        case 200:
                            this.setState({availableRegisters: res.data})
                            break
                        case 204:
                            console.error("no registers set up")
                            bulmaToast.toast({
                                message: `<p class="has-text-centered"><span class="title is-4">Keine Kassen eingerichtet</span><br/><span class="subtitle is-5">Ohne Kassen können keine Transaktionen gespeichert werden</span></p>`,
                                type: 'is-danger',
                                dismissible: false,
                                position: "center",
                                single: false,
                                duration: 10000,
                                animate: {in: 'zoomIn', out: 'zoomOut'},
                            })
                            break
                        default:
                            console.error("unexpected response code")
                            bulmaToast.toast({
                                message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Kassen</span><br/><span class="subtitle is-5">${res.statusText}</span></p>`,
                                type: 'is-danger',
                                dismissible: false,
                                position: "center",
                                single: false,
                                duration: 10000,
                                animate: {in: 'zoomIn', out: 'zoomOut'},
                            })
                    }
                })
                .catch(reason => {
                    bulmaToast.toast({
                        message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Kassen</span><br/><span class="subtitle is-5">${reason}</span></p>`,
                        type: 'is-danger',
                        dismissible: false,
                        position: "center",
                        single: false,
                        duration: 10000,
                        animate: {in: 'zoomIn', out: 'zoomOut'},
                    })
                })
        }

        if (!this.state.availableItems) {
            axios
                .get("/api/registerItems")
                .then(res => {
                    switch (res.status) {
                        case 200:
                            this.setState({availableItems: res.data})
                            break
                        case 204:
                            console.warn("no registers items set up. only user defined items possible")
                            bulmaToast.toast({
                                message: '<p class="has-text-centered"><span class="title is-4">Keine Artikel eingerichtet</span><br/><span class="subtitle is-5">Es können nur benutzerdefinierte Artikel hinzugefügt werden</span></p>',
                                type: 'is-warning',
                                dismissible: false,
                                position: "center",
                                single: false,
                                duration: 10000,
                                animate: {in: 'zoomIn', out: 'zoomOut'},
                            })
                            break
                        default:
                            console.error("unexpected response code")
                            bulmaToast.toast({
                                message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Artikel</span><br/><span class="subtitle is-5">${res.statusText}</span></p>`,
                                type: 'is-danger',
                                dismissible: false,
                                position: "center",
                                single: true,
                                duration: 10000,
                                animate: {in: 'zoomIn', out: 'zoomOut'},
                            })
                    }
                })
                .catch(reason => {
                    bulmaToast.toast({
                        message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Artikel</span><br/><span class="subtitle is-5">${reason}</span><br/>Es können nur benutzerdefinierte Artikel hinzugefügt werden</p>`,
                        type: 'is-warning',
                        dismissible: false,
                        position: "center",
                        single: false,
                        duration: 10000,
                        animate: {in: 'zoomIn', out: 'zoomOut'},
                    })
                })
        }
    }

    private addBillItem(article: Article) {
        let billItems = this.state.billItems
        if (!billItems) {
            billItems = []
        }
        billItems.push(article)
        this.setState({billItems: billItems})
        this.calculateBillTotal()
    }

    private removeBillItem(idx: number) {
        let billItems = this.state.billItems
        if (!billItems) {
            console.warn("calling remove bill item on empty item list")
            return
        }
        billItems.splice(idx, 1)
        this.setState({billItems: billItems})
        bulmaToast.toast({
            message: 'Artikel entfernt',
            type: 'is-info',
            dismissible: false,
            position: "top-center",
            single: true,
            duration: 750,
            animate: {in: 'zoomIn', out: 'zoomOut'},
        })
        this.calculateBillTotal()
    }

    private resetBill() {
        this.setState({billItems: undefined, currentTotal: 0.00})
    }

    private calculateBillTotal() {
        let billItems = this.state.billItems
        if (!billItems) {
            this.setState({currentTotal: 0.00})
            return
        }
        let total = 0.0
        for (const billItem of billItems) {
            total += billItem.price
        }
        this.setState({currentTotal: total})
    }

    private processTransaction() {
        this.setState({callingAPI: true})
        let {billItems, currentTotal} = this.state
        if (!billItems || currentTotal === undefined) {
            console.warn("empty transaction processed")
            bulmaToast.toast({
                message: '<p><span class="title is-4">Leere Transaktion</span><br/><span class="subtitle is-5">Leere Transaktionen können nicht gespeichert werden</span></p>',
                type: 'is-info',
                dismissible: false,
                position: "center",
                single: true,
                duration: 1500,
                animate: {in: 'zoomIn', out: 'zoomOut'},
            })
            this.setState({callingAPI: false})
            return
        }
        let articleCounts: Map<string, number> = new Map<string, number>()
        billItems.forEach((billItem, pos, billItems) => {
            articleCounts.set(billItem.name, (billItems.filter((article) => article.name === billItem.name).length))
        })

        console.log(articleCounts)

        // now build a description for the transaction
        let description = ""
        description = description.trim()

        // now build the actual transaction
        let transaction: RegisterTransaction = {
            Title: `Abendkasse am ${new Date().toLocaleDateString('de-de')} um ${new Date().toLocaleTimeString('de-de')}`,
            Description: description,
            Amount: currentTotal,
            ArticleCounts: Object.fromEntries(articleCounts)

        }
        console.log(JSON.stringify(articleCounts))
        console.log(transaction)

        // now send the transaction to the server
        axios.post('/api/register/transactions', transaction)
            .then(res => {
                switch (res.status) {
                    case 200:
                    case 201:
                        bulmaToast.toast({
                            message: 'Transaktion gespeichert',
                            type: 'is-success',
                            dismissible: false,
                            position: "center",
                            animate: {in: 'fadeIn', out: 'fadeOut'},
                        })
                        this.setState({billItems: [], currentTotal: 0.00})
                        break
                    default:
                        bulmaToast.toast({
                            message: '<p><span class="title is-4">Fehler bei Speicherung der Transaktion</span><br/><span class="subtitle is-5">Der Server antwortete nicht mit der richtigen Antwort</span></p>',
                            type: 'is-warning',
                            dismissible: false,
                            position: "center",
                            single: true,
                            duration: 1500,
                            animate: {in: 'zoomIn', out: 'zoomOut'},
                        })
                }
            })
            .catch(err => {
                bulmaToast.toast({
                    message: `<p><span class="title is-4">Fehler bei Speicherung der Transaktion</span><br/><span class="subtitle is-5">${err}</span></p>`,
                    type: 'is-danger',
                    dismissible: false,
                    position: "center",
                    single: true,
                    duration: 1500,
                    animate: {in: 'zoomIn', out: 'zoomOut'},
                })
            })
            .finally(() => {
                this.setState({callingAPI: false})
            })
    }

    private reloadStatistics() {
        axios
            .get("/api/statistics/sales")
            .then(res => {
                switch (res.status) {
                    case 200:
                        let response: Object = res.data
                        let m = new Map<string, number>(Object.entries(response))
                        let stats = Array.from(m, ([articleName, count]) => ({articleName, count}))
                        this.setState({itemStatistics: stats})
                        break
                }
            })
            .catch(err => {
                bulmaToast.toast({
                    message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Verkausstatistiken</span><br/><span class="subtitle is-5">${err}</span><br/></p>`,
                    type: 'is-warning',
                    dismissible: false,
                    position: "top-center",
                    single: false,
                    duration: 1500,
                    animate: {in: 'zoomIn', out: 'zoomOut'},
                })

            })
    }

    private addCustomBillItem() {
        let articleName = ""
        let articlePrice = 0.00

        if (this.customArticleNameInput.current) {
            if (!this.customArticleNameInput.current || this.customArticleNameInput.current.value === "") {
                this.customArticleNameInput.current.setCustomValidity("Bitte gebe eine Artikelbezeichnung ein")
                this.customArticleNameInput.current.reportValidity()
                return;
            }
            articleName = this.customArticleNameInput.current.value.trim()
            this.customArticleNameInput.current.value = ""
        }

        if (this.customArticlePriceInput.current) {
            if (!this.customArticlePriceInput.current.value || this.customArticlePriceInput.current.value === "") {
                this.customArticlePriceInput.current.setCustomValidity("Bitte gebe einen Preis ein")
                this.customArticlePriceInput.current.reportValidity()
                return
            }
            articlePrice = Number.parseFloat(this.customArticlePriceInput.current.value)
            this.customArticlePriceInput.current.value = ""
        }

        let custArticle: Article = {
            id: articleName,
            name: articleName,
            price: articlePrice,
            icon: "twemoji:pen"
        }
        this.addBillItem(custArticle)
        this.setState({showingCustomItemInput: false})
    }

    render() {
        console.log(this.state)
        // check for authentication
        let auth: AuthContextProps = this.props?.auth
        // let the authentication load
        if (auth.isLoading) {
            return (<div></div>);
        }
        // if the user is not authenticated, then direct them to the login page.
        if (!auth.isAuthenticated) {
            return <Navigate to={"/login"}></Navigate>
        }

        return (
            <div>
                <div className={"mt-1 px-1"}>
                    <div className={"buttons is-centered has-addons mb-1"}>
                        <Button loading={this.state.callingAPI} color={"link"} disabled rounded
                                style={{width: "49%"}}>
                            Reservierungen (WIP)
                        </Button>
                        <Button loading={this.state.callingAPI} color={"info"} rounded onClick={() => {
                            this.reloadStatistics();
                            this.setState({showingStatistics: true})
                        }}
                                style={{width: "49%"}}>
                            Statistiken
                        </Button>
                    </div>
                    <hr className={"m-1"}/>
                    <Heading size={4} textAlign={"center"} className={"my-2"}>
                        Artikel
                    </Heading>
                    <div className={"buttons is-centered mt-0"}>
                        {
                            this.state.availableItems?.map((article, idx) => {
                                return (
                                    <Button color={"info"} textAlign={"center"}
                                            className={"is-light is-fullheight is-5"} rounded
                                            onClick={() => this.addBillItem(article)}>
                                        <span className={"icon-text is-align-items-center"}>
                                            <span className={"icon"}>
                                                <Icon icon={article.icon} height={48}/>
                                            </span>
                                            <span>{article.name}</span>
                                        </span>
                                    </Button>
                                )
                            })
                        }
                        <Button color={"primary"} rounded textAlign={"center"} className={"is-light"} onClick={() => this.setState({showingCustomItemInput: true})}>
                            <span className={"icon-text is-align-items-center"}>
                                <span className={"icon"}>
                                            <Icon height={48} width={48} icon={"twemoji:pen"}/>
                                        </span>
                                <span>Benutzerdefiniert</span>
                            </span>
                        </Button>
                    </div>
                    <hr className={"my-2"}/>
                </div>
                <div>
                    <Heading size={4} className={"my-1"} textAlign={"center"}>
                        Bon
                    </Heading>
                    <Heading size={5} textAlign={"center"} className={"my-1"}>
                        Summe: {this.state.currentTotal?.toFixed(2)} €
                    </Heading>
                    <div className={"buttons is-centered has-addons"}>
                        <Button loading={this.state.callingAPI} color={"success"} rounded
                                style={{width: "49%"}}
                                onClick={() => this.processTransaction()}>
                            Bezahlt
                        </Button>
                        <Button loading={this.state.callingAPI} color={"warning"} rounded
                                style={{width: "49%"}}
                                onClick={() => this.resetBill()}>
                            Bon löschen
                        </Button>
                    </div>
                    <div style={{overflow: "auto"}}>
                        {
                            this.state.billItems?.map((article, index, articles) => {
                                return (
                                    <Columns className={"is-mobile is-gapless my-2"} multiline={false}>
                                        <Columns.Column size={2}
                                                        className={"is-align-content-center has-text-centered"}>
                                            <Icon width={48} icon={article.icon}></Icon>
                                        </Columns.Column>
                                        <Columns.Column size={8} className={"is-align-content-center"}>
                                            <p className={"is-align-self-center"}>
                                                <span className={"title is-size-5"}>{article.name}</span><br/>
                                                <span
                                                    className={"subtitle is-size-6"}>Preis: {article.price.toFixed(2)} €</span>
                                            </p>
                                        </Columns.Column>
                                        <Columns.Column size={1}
                                                        className={"ml-2 is-align-content-center has-text-centered"}>
                                            <Button className={"is-fullheight"} color={"danger"} rounded
                                                    onClick={() => this.removeBillItem(index)}>
                                                <Icon height={24} icon={"iwwa:delete"}/>
                                            </Button>
                                        </Columns.Column>
                                    </Columns>
                                )
                            })
                        }
                    </div>
                </div>
                <Modal show={this.state.showingStatistics} closeOnEsc={true} closeOnBlur={true} onClose={() => {
                    this.setState({showingStatistics: false})
                }}>
                    <Modal.Content>
                        <div className={"box"}>
                            <Heading textAlign={"center"} size={4}>Verkaufsstatistiken der letzten 24h</Heading>
                            <table className={"table is-fullwidth is-hoverable"}>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Anzahl</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.itemStatistics?.map(({articleName, count}) => {
                                        return (
                                            <tr>
                                                <th>{articleName}</th>
                                                <td>{count}</td>
                                            </tr>
                                        )
                                    })
                                }
                                </tbody>
                            </table>
                        </div>
                    </Modal.Content>
                </Modal>
                <Modal show={this.state.showingCustomItemInput}
                       closeOnEsc={true} closeOnBlur={true}
                       onClose={() => {
                            this.setState({showingCustomItemInput: false})
                        }}>
                    <Modal.Content>
                        <Box>
                            <Heading textAlign={"center"} size={4}>Benutzerdefinierter Artikel</Heading>
                            <div className={"field"}>
                                <label className={"label"}>Artikelbezeichnung</label>
                                <div className={"control"}>
                                    <input ref={this.customArticleNameInput} className={"input"} type={"text"} min={6}/>
                                </div>
                                <p className="help">Kurze Bezeichnung des Artikels</p>
                            </div>
                            <div className={"field"}>
                                <label className={"label"}>Preis in Euro</label>
                                <div className={"control is-expanded"}>
                                    <input ref={this.customArticlePriceInput} className={"input"} type={"number"} min={0}
                                           step={0.01}/>
                                </div>
                                <p className="help">Minimum: 0.00</p>
                            </div>
                            <div className={"buttons"}>
                                <Button rounded color={"success"} className={"is-light"} fullwidth
                                        onClick={() => this.addCustomBillItem()}>
                                    Hinzufügen
                                </Button>
                            </div>
                        </Box>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}

export default withAuth(Register);