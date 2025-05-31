// Client to Server
export enum ServerCodes {
    INIT = "i",
    STATUS = "s",
    ROLL = "r",
    MESSAGE = "m",
    STOP_TURN = "t",
    BUY_DEVCARD = "bd",
    BUY_ROAD = "br",
    BUY_SETTLEMENT = "bs",
    BUY_CITY = "bc",
    MOVE_ROBBER = "mr",
    DROP_MATS = "dp",
    DEV_YEAROFPLENTY = "dyop",
}
// Server to Client
export enum ClientCodes {
    STATUS = "s",
    INIT = "i",
    TURN_DICE = "t",
    MESSAGE = "m",
    TURN_SWITCH = "a",
    PLAYER_UPDATE = "pu",
    BANK_UPDATE = "bu",
    OTHER_UPDATE = "ou",
    ACHIVEMENTS_UPDATE = "ao",
    MOVE_ROBBER = "mr",
}
