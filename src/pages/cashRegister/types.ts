type RegisterItem = {
    name: string,
    price: number,
    icon: string,
    buttonColor?: string
}

type RegisterStatus = {
    articleList: {name: string, price: number}[],
    total: number,
}

export type { RegisterItem, RegisterStatus }