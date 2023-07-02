import {Article} from "../register/types";

export enum SettingsPage {
    REGISTER,
    DATABASE
}

export type PageState = {
    /**
     *
     */
    callingAPI: boolean

    /**
     * A indicator
      */
    currentSettingsPage: SettingsPage

    /**
     * contains all already server-side stored items
     */
    serverSideItems?: Article[] | null

    /**
     * contains all already server-side stored items
     */
    localItems?: Article[] | null

    /**
     * contains all articles that shall be deleted from the server
     */
    deletedArticles?: Article[] | null
}
