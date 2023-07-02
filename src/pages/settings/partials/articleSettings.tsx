import {Component, createRef} from "react";
import {ArticleSettingsState} from "./state";
import {Article} from "../../register/types";

class ArticleSettings extends Component<any, ArticleSettingsState> {
    /**
     * A reference to the input used to edit the name of an item
     *
     * @private
     * @type React.RefObject<HTMLInputElement>
     */
    private inputEditItemName: React.RefObject<HTMLInputElement> = createRef()

    /**
     * A reference to the input used to edit the name of an item
     *
     * @private
     * @type React.RefObject<HTMLInputElement>
     */
    private inputEditItemPrice: React.RefObject<HTMLInputElement> = createRef()

    /**
     * A reference to the input used to edit the name of an item
     *
     * @private
     * @type React.RefObject<HTMLInputElement>
     */
    private inputEditItemIcon: React.RefObject<HTMLInputElement> = createRef()

    /**
     * This function marks an article that is stored on the server for deletion.
     *
     * The supplied article will only be deleted when processing the changes
     * made on this page by triggering `processChanges()`
     * @param article The article that shall be deleted
     */
    private deleteArticle(article: Article) {
        // check if the list for the deleted articles is already initialized
        let deletedArticles = this.state.articles?.deleted
        if (!deletedArticles) {
            // initialize the list for the deleted articles
            deletedArticles = new Set<string>()
        }
        // now check if the article is already listed in the array by converting
        // the array into a set
        if (deletedArticles.has(article.id)) {
            console.warn("cannot delete article more than once")
            return
        }
        // since the article was not marked for deletion mark it now
        deletedArticles.add(article.id)
        // and now update the current settings state to populate the marking
        this.setState({articles: {deleted: deletedArticles}})
    }

    /**
     * This function removes the mark on an article indicating its deletion.
     *
     * @param article The article that shall be restored
     */
    private restoreArticle(article: Article) {
        // check if the list for the deleted articles is already initialized
        let deletedArticles = this.state.articles?.deleted
        if (!deletedArticles) {
            // initialize the list for the deleted articles
            deletedArticles = new Set<string>()
        }
        // now check if the article is already listed in the array by converting
        // the array into a set
        if (deletedArticles.has(article.id)) {
            deletedArticles.delete(article.id)
        }
        // and now update the current settings state to populate the marking
        this.setState({articles: {deleted: deletedArticles}})
    }

    /**
     * This function triggers the editing process for an item that is stored on
     * the server
     *
     * @param article The article that shall be edited
     */
    private startArticleEditing(article: Article) {
        // just set the state to show the edit modal and set the currently
        // edited item
        this.setState({modals: {edit: true}, currentlyEditedArticle: article })
    }

    /**
     * This function stores the edited article information and cleans up the
     * editing modal
     */
    private saveEditedArticle() {
        // get the input elements from the according references
        let editNameInput = this.inputEditItemName.current
        let editPriceInput = this.inputEditItemPrice.current
        let editIconInput = this.inputEditItemIcon.current

        // now get the currently edited article and make sure it is set
        let {currentlyEditedArticle} = this.state
        if (!currentlyEditedArticle) {
            console.error("no article is currently in edit mode")
            return;
        }

        // now make sure that all references are valid
        if (!editNameInput || !editPriceInput || !editIconInput) {
            console.error("at least one input is not referenced")
            return;
        }

        // now set the new name of the article if the value is not empty
        if (editNameInput.value.trim() !== "") {
            editNameInput.setCustomValidity("Das Feld darf nicht leer sein!")
            editNameInput.reportValidity()
            return;
        }
        currentlyEditedArticle.name = editNameInput.value.trim()

        // the same with the icon
        if (editIconInput.value.trim() === "") {
            editIconInput.setCustomValidity("Das Feld darf nicht leer sein!")
            editIconInput.reportValidity()
            return;
        }
        currentlyEditedArticle.icon = editIconInput.value.trim()

        // since the price is a float the value may not be empty...
        if (editPriceInput.value.trim() === "") {
            editPriceInput.setCustomValidity("Das Feld darf nicht leer sein!")
            editPriceInput.reportValidity()
            return;
        }

        //... and be parseable as a float
        if (Number.isNaN(Number.parseFloat(editPriceInput.value.trim()))) {
            editPriceInput.setCustomValidity("Das Feld beinhaltet keine gültige Zahl")
            editPriceInput.reportValidity()
            return;
        }
        currentlyEditedArticle.price = Number.parseFloat(editPriceInput.value.trim())

        // now get the array of the already edited articles and initialize it if
        // needed and the set of the ids of the edited articles
        let editedArticleIds = this.state.articles?.edited?.ids
        let editedArticles = this.state.articles?.edited?.articles

        if (!editedArticleIds) {
            editedArticleIds = new Set<string>()
        }
        if (!editedArticles) {
            editedArticles = []
        }

        // now check if the article was already edited once
        if (editedArticleIds.has(currentlyEditedArticle.id)) {
            // find the index of the old article update
            let oldIndex = editedArticles.findIndex(
                (article) => article.id === currentlyEditedArticle?.id
            )
            // now splice the array at that point
            editedArticles.splice(oldIndex, 1)
        }

        // now add the edited article to both lists
        editedArticleIds.add(currentlyEditedArticle.id)
        editedArticles.push(currentlyEditedArticle)

        // now update the state of the page to reflect the changes
        this.setState({articles: {edited: {ids: editedArticleIds, articles: editedArticles}}})
    }
}