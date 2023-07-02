import {Component, createRef, ReactNode} from "react";
import {Article, PageState, RegisterTransaction} from "./types";
import axios from "axios";
import * as bulmaToast from "bulma-toast";
import {Navigate} from "react-router-dom";
import {AuthContextProps, withAuth} from "react-oidc-context";
import {Box, Button, Columns, Heading, Modal} from "react-bulma-components";
import {Icon} from "@iconify/react";
import {v4 as uuid} from "uuid";
import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, ChartData, registerables} from 'chart.js';
import {generate} from 'patternomaly';
import stc from 'string-to-color';
import {TailSpin} from "react-loader-spinner";
import colors from "../../_colors.module.scss"

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
        this.state = {
            currentTotal: 0.00,
            enableRegister: false,
            pulledAvailableItems: false,
            pulledAvailableRegisters: false
        }
        ChartJS.register(...registerables);
    }

    componentDidMount() {
        if (!this.state.pulledAvailableRegisters) {
            axios
                .get("/api/registers")
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
                .finally(() => this.setState({pulledAvailableRegisters: true}))
        }

        if (!this.state.pulledAvailableItems) {
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
                    console.error(reason)
                    bulmaToast.toast({
                        message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Artikel</span><br/><span class="subtitle is-5">${reason}</span><br/>Es können nur benutzerdefinierte Artikel hinzugefügt werden</p>`,
                        type: 'is-warning',
                        dismissible: false,
                        position: "center",
                        single: false,
                        duration: 10000,
                        animate: {in: 'zoomIn', out: 'zoomOut'},
                    })
                    this.setState({availableItems: []})
                })
                .finally(() => {
                    this.setState({pulledAvailableItems: true})
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
        let articles: Map<Article, { count: number, price: number }> = new Map<Article, {
            count: number,
            price: number
        }>()
        billItems.forEach((billItem, pos, billItems) => {
            articles.set(billItem, {
                count: (billItems.filter((article) => article.id === billItem.id).length),
                price: billItem.price
            })
        })

        // now build a description for the transaction
        let description = ""
        articles.forEach((countAndPrice, article) => {
            description += `${countAndPrice.count}x ${article.name} á ${countAndPrice.price.toFixed(2)} €\n`
        })
        description = description.trim()

        // now build the statistics object by checking the names
        let articleCounts: Map<string, number> = new Map<string, number>()
        articles.forEach((countAndPrice, article) => {
            articleCounts.set(article.name, countAndPrice.count)
        })

        // now build the actual transaction
        let transaction: RegisterTransaction = {
            Title: `Abendkasse am ${new Date().toLocaleDateString('de-de')} um ${new Date().toLocaleTimeString('de-de')}`,
            Description: description,
            Amount: currentTotal,
            ArticleCounts: Object.fromEntries(articleCounts)

        }
        // now send the transaction to the server
        axios.post(`/api/registers/${this.state.currentRegister}/transactions`, transaction)
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
        this.setState({callingAPI: true})
        axios
            .get("/api/statistics/items")
            .then(res => {
                switch (res.status) {
                    case 200:
                        let rawData: { name: string, count: number }[] = res.data
                        let datasets = rawData.map((datapoint, index, arr) => {
                            let d = []
                            for (let i = 0; i < index; i++) {
                                d.push({key: arr[i].name, value: null})
                            }
                            d.push({key: datapoint.name, value: datapoint.count})
                            for (let i = index + 1; i < arr.length; i++) {
                                d.push({key: arr[i].name, value: null})
                            }
                            return {
                                label: datapoint.name,
                                data: d,
                                backgroundColor: generate([stc(datapoint.name)]),
                                parsing: {
                                    xAxisKey: 'key',
                                    yAxisKey: 'value'
                                }
                            }
                        })
                        let chartJSData: ChartData<'bar', ({ key: string, value: number | null }) []> = {
                            datasets: datasets
                        }
                        console.log(chartJSData)
                        this.setState({itemStatistics: chartJSData})
                        break
                    case 204:
                        this.setState({itemStatistics: null})
                }
            })
            .catch(err => {
                bulmaToast.toast({
                    message: `<p class="has-text-centered"><span class="title is-4">Fehler beim Laden der Verkaufsstatistiken</span><br/><span class="subtitle is-5">${err}</span><br/></p>`,
                    type: 'is-warning',
                    dismissible: false,
                    position: "top-center",
                    single: false,
                    duration: 1500,
                    animate: {in: 'zoomIn', out: 'zoomOut'},
                })
            })
            .finally(() => {
                this.setState({callingAPI: false})
            })
    }

    private addCustomBillItem() {
        // get the current list of items
        let currentArticles = this.state.availableItems
        // now check if the list is initialized
        if (!currentArticles) {
            currentArticles = []
        }

        // now define the article name and price to write them later
        let articleName: string
        let articlePrice: number

        // now check if the name input reference has a current element set
        if (!this.customArticleNameInput.current) {
            console.error("no article name input referenced")
            throw new Error("no article name input referenced")
        }
        let articleNameInput = this.customArticleNameInput.current

        // now check if the name input reference has a current element set
        if (!this.customArticlePriceInput.current) {
            console.error("no article price input referenced")
            throw new Error("no article price input referenced")
        }
        let articlePriceInput = this.customArticlePriceInput.current

        // now check if the article name is empty or a string only containing whitespaces
        if (articleNameInput.value.trim() === "") {
            articleNameInput.setCustomValidity("Artikelname erforderlich")
            articleNameInput.reportValidity()
            return;
        }
        articleName = articleNameInput.value.trim()

        let articleNameAlreadyPresent = currentArticles.some((a) => {
            return a.name === articleName
        })
        if (articleNameAlreadyPresent) {
            articleNameInput.setCustomValidity("Artikelname bereits benutzt")
            articleNameInput.reportValidity()
            return;
        }

        // now check if the article price is empty or a string only containing whitespaces
        if (articlePriceInput.value.trim() === "") {
            articlePriceInput.setCustomValidity("Preis erforderlich")
            articlePriceInput.reportValidity()
            return;
        }

        // now try to parse the price
        articlePrice = Number.parseFloat(articlePriceInput.value.trim())
        if (Number.isNaN(articlePrice)) {
            articlePriceInput.setCustomValidity("Ungültiger Wert eingegeben")
            articlePriceInput.reportValidity()
            return;
        }

        // now build the custom article
        let article: Article = {
            id: uuid(),
            name: articleName,
            price: articlePrice,
            icon: "twemoji:pen"
        }

        // add the item and hide the popup
        currentArticles.push(article)
        this.setState({availableItems: currentArticles, showingCustomItemInput: false})

        // now clear the input fields values
        articleNameInput.value = ""
        articlePriceInput.value = ""


    }

    private setCurrentRegister(event: React.ChangeEvent<HTMLSelectElement>) {

        // get the now selected register
        let selectedRegister = event.target.value
        // now set the state accordingly
        this.setState({currentRegister: selectedRegister, enableRegister: true})
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
                    <div className={"select is-rounded is-fullwidth"}>
                        <select required onChange={(event) => this.setCurrentRegister(event)}>
                            <option disabled selected>Bitte wähle eine Kasse aus</option>
                            {
                                this.state.availableRegisters?.map((register) => {
                                    return (
                                        <option value={register.id}>{register.name} - {register.description}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                    <hr className={"m-1"}/>
                    <Heading size={4} textAlign={"center"} className={"my-2"}>
                        Artikel
                    </Heading>
                    <div className={"buttons is-centered mt-0"}>
                        {
                            this.state.availableItems?.map((article) => {
                                return (
                                    <Button color={"info"} textAlign={"center"}
                                            className={"is-light is-fullheight is-5"} rounded
                                            onClick={() => this.addBillItem(article)}
                                            disabled={!this.state.enableRegister}>
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
                        <Button disabled={!this.state.enableRegister}
                                color={"primary"}
                                rounded
                                textAlign={"center"}
                                className={"is-light"}
                                onClick={() => this.setState({showingCustomItemInput: true})}>
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
                                disabled={!this.state.enableRegister}
                                style={{width: "49%"}}
                                onClick={() => this.processTransaction()}>
                            Bezahlt
                        </Button>
                        <Button loading={this.state.callingAPI} color={"warning"} rounded
                                disabled={!this.state.enableRegister}
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
                    <Modal.Card>
                        <Modal.Card.Header>
                            <Modal.Card.Title textAlign={"center"}>
                                Verkaufsstatistiken der letzten 24h
                            </Modal.Card.Title>
                        </Modal.Card.Header>
                        <Modal.Card.Body textAlign={"center"}>
                            {
                                ((): ReactNode => {
                                    if (this.state.callingAPI) {
                                        return <TailSpin
                                            height="80"
                                            width="80"
                                            ariaLabel="tail-spin-loading"
                                            radius="1"
                                            color={colors.primary}
                                            wrapperStyle={{}}
                                            wrapperClass="is-justify-content-center"
                                            visible={this.state.callingAPI}
                                        />
                                    }
                                    if (!this.state.itemStatistics) {
                                        return <span className={"icon-text"}>
                                            <span className={"icon"}>
                                                <Icon icon={"fluent-emoji:warning"} height={"1.25rem"}/>
                                            </span>
                                            <span
                                                className={"is-size-5"}>Keine Daten für die letzten 24h verfügbar</span>
                                            <span className={"icon"}>
                                                <Icon icon={"fluent-emoji:warning"} height={"1.25rem"}/>
                                            </span>
                                        </span>
                                    }
                                    return <Bar options={{responsive: true, skipNull: true}}
                                                data={this.state.itemStatistics}/>
                                })()
                            }
                        </Modal.Card.Body>
                    </Modal.Card>
                </Modal>
                <Modal show={this.state.showingCustomItemInput}
                       closeOnEsc={true} closeOnBlur={true}
                       onClose={() => {
                           this.setState({showingCustomItemInput: false})
                       }}>
                    <Modal.Content>
                        <Box>
                            <Heading textAlign={"center"} size={4}>Benutzerdefinierten Artikel hinzufügen</Heading>
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
                                    <input ref={this.customArticlePriceInput} className={"input"} type={"number"}
                                           min={0}
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