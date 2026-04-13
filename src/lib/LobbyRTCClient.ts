import CONFIG from '@/config'
import Axios, { AxiosRequestConfig } from 'axios'

// @ts-ignore
const { LOBBYRTC_CONNECTION_URL, PEER_SECURE } = CONFIG;

class LobbyRTCClient {
    static readonly gameId: number = 1;
    static instance: LobbyRTCClient | null = null;

    static getInstance() {
        if (!LobbyRTCClient.instance) {
            LobbyRTCClient.instance = new LobbyRTCClient();
        }
        return LobbyRTCClient.instance;
    }

    private axios = Axios.create({
        baseURL: LOBBYRTC_CONNECTION_URL,
        timeout: 5000,
    });

    private managedRoom: { accessToken: string, token: string, playersCount: number } | null = null;

    constructor() {
        this.axios.get('/sys/readyz').then((res) => {
            if (res.status === 200) console.log("LobbyRTC Server is ready");
            else console.error("LobbyRTC Server is not ready");
        }).catch(() => {
            console.error("LobbyRTC Server is not ready");
        });
    }

    async listLobbies() {
        const { data } = await this.axios.get(`/lobbies/${LobbyRTCClient.gameId}/visibles`);

        return data as Array<{ token: string, playersCount: number, password?: string }>;
    }
    async joinLobby(token: string, password?: string) {
        const passwordSettings: AxiosRequestConfig = password ? { auth: { password, username: '' } } : {};
        const { data } = await this.axios.get(`/lobbies/${LobbyRTCClient.gameId}/${token}`, passwordSettings);;

        return data as { webRTCId: string };
    }

    async quickPlay() {
        const { data } = await this.axios.get(`/lobbies/${LobbyRTCClient.gameId}/quick-play`);

        return data as { webRTCId: string, token: string, playersCount: number };
    }

    async hostLobby(webRTCId: string, password?: string, visible: boolean = true) {
        const { data } = await this.axios.post(`/lobbies/${LobbyRTCClient.gameId}`, { webRTCId, visible, playersCount: 0, password });

        this.managedRoom = {
            accessToken: data.accessToken,
            token: data.token,
            playersCount: 0
        };

        return this.managedRoom.token;
    }

    async updatePlayersCount(updateFn: ((old: number) => number) | number) {
        if (this.managedRoom === null) throw new Error("Not connected to a lobby");

        this.managedRoom.playersCount = typeof updateFn === 'function' ? updateFn(this.managedRoom.playersCount) : updateFn;
        console.log('this.managedRoom.accessToken', this.managedRoom.accessToken)
        await this.axios.put(`/lobbies/players`, { accessToken: this.managedRoom.accessToken, playersCount: this.managedRoom.playersCount });
    }

    async closeLobby() {
        const result = await this.closeLobbyQuiet();
        if (result === -1) throw new Error("Not connected to a lobby");
        if (result !== 0) throw result;
    }

    async closeLobbyQuiet() {
        if (this.managedRoom === null) return -1;

        try {
            await this.axios.delete(`/lobbies/`, { data: { accessToken: this.managedRoom.accessToken } });
        } catch (err) { return err }
        this.managedRoom = null;

        return 0;
    }

    public peerSettings() {
        return {
            host: LOBBYRTC_CONNECTION_URL.split(':')[1].replace('//', ''),
            path: '/peer',
            port: /:\d+$/.test(LOBBYRTC_CONNECTION_URL) ? parseInt(LOBBYRTC_CONNECTION_URL.split(':')[2]) : LOBBYRTC_CONNECTION_URL.includes('https://') ? 443 : 80,
            secure: LOBBYRTC_CONNECTION_URL.includes('https://') ? true : (PEER_SECURE ?? false)
        };
    }
}

export default LobbyRTCClient.getInstance();