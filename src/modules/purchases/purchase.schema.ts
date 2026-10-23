export interface Purchase {
    playerId: string;
    webhookEventId: string;
    externalId: string; //that's the internal id come from the external system, like "internalId" by the centralcart payload data
    amount: number;
    purchaseDate: string; //that's the date come from the external system, like "purchaseDate" by the centralcart payload data
}