import CashRegister from "../../types/cashRegister";

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
     * contains the current total of all bill items
     *
     * @type number
     */
    currentTotal?: number

    /**
     * contains the statistics of every single article sold in the last 24h
     */
    itemStatistics?: { articleName: string; count: number; }[]

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