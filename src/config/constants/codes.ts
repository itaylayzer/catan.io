// Client to Server
export enum ServerCodes {
    INIT = "i",
    STATUS = "s",
    ROLL = "r",
    MESSAGE = "m",
    STOP_TURN = "t",
    BUY_DEVCARD = "d",
}
// Server to Client
export enum ClientCodes {
    STATUS = "s",
    INIT = "i",
    TURN_DICE = "t",
    MESSAGE = "m",
    TURN_SWITCH = "a",
}
