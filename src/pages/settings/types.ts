import {Article} from "../register/types";

export enum SettingsPage {
    REGISTER,
    DATABASE
}

export type PageState = {
    callingAPI: boolean
    currentSettingsPage: SettingsPage
    serverSideItems?: Article[] | null
    localItems?: Article[] | null
    deletedArticles?: Article[] | null
    currentlyEditedArticle?: Article
    editedArticles?: Article[] | null
    showArticleEditPopup?:  boolean
}
