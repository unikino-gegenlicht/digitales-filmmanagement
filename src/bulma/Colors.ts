/**
 * Bulma CSS color modifiers
 *
 * These modifiers are used to change the colors of some elements and components.
 *
 * @see https://bulma.io/documentation/
 */
export enum ColorModifier {
    Black = "is-black",
    Dark = "is-dark",
    Light = "is-light",
    White = "is-white",
    Primary = "is-primary",
    Link = "is-link",
    Info = "is-info",
    Success = "is-success",
    Warning = "is-warning",
    Danger = "is-danger",
}

/**
 * Bulma CSS Color Helpers
 *
 * These helpers are used to change the color of the text in paragraphs,
 * headings, etc. You will need to prefix these with `has-text-` or
 * `has-background-` to make them work correctly.
 *
 * @see https://bulma.io/documentation/helpers/color-helpers/
 */
export enum ColorHelper {
    White = "white",
    Black = "black",
    Light = "light",
    Dark = "dark",
    Primary = "primary",
    Link = "link",
    Info = "info",
    Success = "success",
    Warning = "warning",
    Danger = "danger",
    PrimaryLight = "primary-light",
    LinkLight = "link-light",
    InfoLight = "info-light",
    SuccessLight = "success-light",
    WarningLight = "warning-light",
    DangerLight = "danger-light",
    PrimaryDark = "primary-dark",
    LinkDark = "link-dark",
    InfoDark = "info-dark",
    SuccessDark = "success-dark",
    WarningDark = "warning-dark",
    DangerDark = "danger-dark",
    BlackBis = "black-bis",
    BlackTer = "black-ter",
    GreyDarker = "grey-darker",
    GreyDark = "grey-dark",
    Grey = "grey",
    GreyLight = "grey-light",
    GreyLighter = "grey-lighter",
    WhiteTer = "white-ter",
    WhiteBis = "white-bis",
}

export function GetCSSClassName(color: ColorHelper, forText?: boolean, forBackground?: boolean,) {
    if (forText && forBackground) {
        throw new Error("Cannot use forText and forBackground at the same time");
    }
    if (!forText && !forBackground) {
        throw new Error("Must use either forText or forBackground");
    }
    if (forText) {
        return `has-text-${color}`;
    }
    if (forBackground) {
        return `has-background-${color}`;
    }
}