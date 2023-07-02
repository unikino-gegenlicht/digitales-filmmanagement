import {Article} from "../../register/types";

/**
 * A type describing the current state of the article settings
 */
export type ArticleSettingsState = {
    /**
     * An indicator for running api queries that may modify the data visible
     */
    callingAPI?: boolean

    /**
     * a nested object containing the following items:
     *      - server-side items (fromServer)
     *      - locally created items that are not stored on the server yet (new)
     *      - a list of ids for edited server side items
     */
    articles?: {
        /**
         * a array containing the original articles sent from the server
         */
        original?: Article[]
        /**
         * an array containing the new articles that shall be stored on the
         * server
         */
        new?: Partial<Article>[]
        /**
         * another nested object used to keep track of the edited articles
         */
        edited?: {
            /**
             * a set containing the ids of all edited articles
             */
            ids: Set<string>

            /**
             * an array containing the updated articles
             */
            articles: Article[]
        }
        deleted?: Set<string>
    }

    /**
     * Holds the reference to the currently edited article in it's non-modified
     * state
     */
    currentlyEditedArticle?: Article

    /**
     * a nested object containing booleans triggering the display of modals used
     * for editing and creating articles
     */
    modals?: {
        edit?: boolean
        new?: boolean
    }
}