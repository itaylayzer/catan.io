import LobbyRTCClient from "@/lib/LobbyRTCClient";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import SpinnerCircleDemo from "@/components/customized/spinner/spinner-02";
import { FaUser } from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { toast } from "sonner";
import { MdKey } from "react-icons/md";

export function LobbiesTable({
    onClickLobby,
}: {
    onClickLobby: (code: string) => void;
}) {
    const [lobbies, setLobbies] =
        useState<Awaited<ReturnType<typeof LobbyRTCClient.listLobbies>>>();

    const loadLobbies = async () => {
        try {
            const _lobbies = await LobbyRTCClient.listLobbies();
            setLobbies(_lobbies);
        } catch (error) {
            toast("Failed to load lobbies");
            console.error("Failed to load lobbies", error);
        }
    };

    useEffect(() => {
        loadLobbies();
    }, []);

    return (
        <div className="w-full h-full p-2 max-h-80 flex flex-col items-center justify-center gap-4">
            {!lobbies ? (
                <SpinnerCircleDemo />
            ) : lobbies.length === 0 ? (
                <p className="my-10">No lobbies available</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Lobby Code</TableHead>
                            <TableHead className="size-1"></TableHead>
                            <TableHead>Players</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lobbies.map((lobby) => (
                            <TableRow
                                className="cursor-pointer"
                                key={lobby.token}
                                onClick={() => {
                                    onClickLobby(lobby.token);
                                }}
                            >
                                <TableCell>
                                    <MdMeetingRoom />
                                </TableCell>
                                <TableCell>{lobby.token}</TableCell>
                                <TableCell>
                                    {lobby.password && <MdKey color="gold" />}
                                </TableCell>
                                <TableCell className="flex items-center gap-2">
                                    {lobby.playersCount} / 4{" "}
                                    <FaUser size={12} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
