import {Component, createRef} from "react";
import {Article, PageState, RegisterTransaction} from "./types";
import axios from "axios";
import * as bulmaToast from "bulma-toast";
import Transaction from "../../types/transaction";
import {Navigate} from "react-router-dom";
import {AuthContextProps, withAuth} from "react-oidc-context";
import {Button, Columns, Heading} from "react-bulma-components";
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
        // now build a description for the transaction
        let description = ""
        for (let billItem of billItems) {
            description += `1x ${billItem.name} á ${billItem.price.toFixed(2)} €\n`
        }
        description = description.trim()

        // now build the actual transaction
        let transaction: RegisterTransaction = {
            Title: `Abendkasse am ${new Date().toLocaleDateString('de-de')} um ${new Date().toLocaleTimeString('de-de')}`,
            Description: description,
            Amount: currentTotal,
            Articles: billItems
        }

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

    render() {
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
                        <Button loading={this.state.callingAPI} color={"info"} rounded disabled
                                style={{width: "49%"}}>
                            Statistiken (WIP)
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
                        <Button color={"primary"} rounded textAlign={"center"} className={"is-light"}>
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

            </div>
        )
    }


}

export default withAuth(Register);