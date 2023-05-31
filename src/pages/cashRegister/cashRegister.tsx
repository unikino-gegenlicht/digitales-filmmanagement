import React, {Component} from "react";
import {RegisterItem, RegisterStatus} from "./types";
import {AuthContextProps, withAuth} from "react-oidc-context";
import {Navigate} from "react-router-dom";
import {Button, Columns, Content, Heading} from "react-bulma-components";
import Navigation from "../../components/navbar/navbar";
import * as bulmaToast from 'bulma-toast'

function showReservations() {
    // todo: create modal and render contents into it read by the request
    console.log("loading reservations");
}


class CashRegister extends Component<any, RegisterStatus> {

    constructor(props: any) {
        super(props);
        this.state = {
            articleList: [],
            total: 0.00
        }
    }

    addToArticleList(name: string, price: number) {
        let articleList = this.state?.articleList
        articleList?.push({name: name, price: price})
        let total = 0.00
        for (let i = 0; i < articleList?.length; i++) {
            let article = articleList[i]
            total += article.price
        }
        this.setState({
            articleList: articleList,
            total: total
        })
    }

    removeItemFromBill(itemIndex: number) {
        let articleList = this.state.articleList
        articleList.splice(itemIndex, 1);
        let total = 0
        for (let i = 0; i < articleList?.length; i++) {
            let article = articleList[i]
            total += article.price
        }
        this.setState({
            articleList: articleList,
            total: total
        })
    }

    processTransaction() {
        // first store the list and total price locally
        let {articleList, total} = this.state
        // then reset the current state to allow a new transaction to be processed
        this.setState({
            articleList: [],
            total: 0
        })
        // todo: send transaction to backend service

        bulmaToast.toast({
            message: 'Transaktion auf dem Server gespeichert',
            type: 'is-success',
            dismissible: true,
            animate: { in: 'fadeIn', out: 'fadeOut' },
        })
    }

    resetTransaction() {
        // reset the current state to allow a new transaction to be processed
        this.setState({
            articleList: [],
            total: 0
        })
        // todo: send transaction to backend service

        bulmaToast.toast({
            message: 'Transaktion zurückgesetzt',
            type: 'is-warning',
            dismissible: true,
            animate: { in: 'fadeIn', out: 'fadeOut' },
        })
    }


    render() {
        console.log(this.props)
        // access the auth properties
        let auth: AuthContextProps = this.props?.auth
        // let the authentication load
        if (auth.isLoading) {
            return (<div></div>);
        }
        // if the user is not authenticated, then direct them to the login page.
        if (!auth.isAuthenticated) {
            return <Navigate to={"/login"}></Navigate>
        }
        let itemButtons = []
        for (let i = 0; i < this.props?.items.length; i++) {
            let item: RegisterItem = this.props.items[i]
            itemButtons.push(
                <Button color={item.buttonColor} rounded className={"is-fullheight is-size-4-desktop is-size-5-touch"} style={{wordWrap: "break-word"}} onClick={() => this.addToArticleList(item.name, item.price)}>
                    <span className={"mx-1"}>{item.icon}</span> {item.name} <span className={"mx-1"}>{item.icon}</span>
                </Button>
            )
        }
        // now prepare the itemized bill
        let billItems = []
        for (let i = 0; i < this.state.articleList.length; i++) {
            let item = this.state.articleList[i];
            billItems.push(
                <div className={"list-item"}>
                    <div className={"list-item-content"}>
                        <div className={"list-item-title"}>{item.name}</div>
                        <div className={"list-item-description"}>Preis: {item.price.toFixed(2)} €</div>
                        <div className={"list-item-controls"}>
                            <Button color={"danger"} onClick={() => this.removeItemFromBill(i)}>
                                <i className="ri-delete-bin-2-line"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
        // now render the cash register page
        return (
            <div>
                <Navigation/>
                <Content mt={2} mx={2}>
                    <Columns className={"is-mobile"}>
                        <Columns.Column size={6}>
                            <Button fullwidth={true} color={"link"} rounded size={"medium"} onClick={showReservations}>Reservierungen</Button>
                        </Columns.Column>
                        <Columns.Column size={6}>
                            <Button fullwidth={true} color={"link"} rounded size={"medium"}>Statistiken</Button>
                        </Columns.Column>
                    </Columns>
                    <Heading className={"is-size-3-desktop is-size-4-touch"} textAlign={"center"}>Kasse</Heading>
                    <div className={"buttons is-centered"}>
                        {itemButtons}
                    </div>
                    <hr/>
                    <Heading size={4} textAlign={"center"}>Bon</Heading>
                    <div className={"list is-fullwidth"} style={{height: "40vh", overflow: "auto"}}>
                        {billItems}
                    </div>
                    <Heading size={5} textAlign={"left"}>Summe: {this.state.total.toFixed(2)} €</Heading>
                    <div className={"buttons is-centered has-addons"}>
                        <Button color={"success"} style={{width: "50%"}} rounded size={"medium"} onClick={() => this.processTransaction()}>Bezahlt</Button>
                        <Button color={"warning"} style={{width: "50%"}} rounded size={"medium"} onClick={() => this.resetTransaction()}>Zurücksetzen</Button>
                    </div>

                </Content>
            </div>
        )
    }
}

export default withAuth(CashRegister);