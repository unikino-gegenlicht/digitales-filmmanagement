import CashRegister from "../../types/cashRegister";
import {ChartData} from "chart.js";

/**
 * Article represents a single sellable article pulled from the api
 */
type Article = {
    id: string,
    name: string,
    price: number,
    icon: string,
}

type RegisterTransaction = {
    Title: string,
    Description: string,
    Amount: number,
    ArticleCounts: any
}

/**
 *
 */
type PageState = {
    /**
     * contains an array of articles available for sale
     *
     * @type Article[]
     */
    availableItems?: Article[]

    /**
     * contains a list of all available cash registers
     *
     * @type CashRegister[]
     */
    availableRegisters?: CashRegister[]

    /**
     * contains an array of articles that are currently on the bill
     *
     * @type Article[]
     */
    billItems?: Article[]

    /**
     * Used to deactivate buttons while calling the api to disallow changes
     *
     * @type boolean
     */
    callingAPI?: boolean

    /**
     *
     */
    currentRegister?: string

    /**
     * contains the current total of all bill items
     *
     * @type number
     */
    currentTotal?: number

    /**
     * indicator if the buttons of the register shall be enabled or not
     */
    enableRegister: boolean

    /**
     * contains the statistics of every single article sold in the last 24h
     */
    itemStatistics?: ChartData <'bar', ({key: string, value: number | null}) []>

    /**
     * contains an indicator used to check if the available items were pulled from the server
     */
    pulledAvailableItems: boolean

    /**
     * contains an indicator used to check if the available items were pulled from the server
     */
    pulledAvailableRegisters: boolean

    /**
     * a boolean used to set the state of the custom article editor visibility
     *
     * @type boolean
     */
    showingCustomItemInput?: boolean

    /**
     * a boolean used to set the state of the reservation list visibility
     *
     * @type boolean
     */
    showingReservationList?: boolean

    /**
     * a boolean used to set the state of the statistics modal
     *
     * @type boolean
     */
    showingStatistics?: boolean

}

export type {Article, RegisterTransaction, PageState}