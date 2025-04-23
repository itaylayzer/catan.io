import { SortedList } from "@/structs/sorted-list";

export type MessagePack = {
    date: Date;
    from: number; // id
    message: string;
};
export const messages = new SortedList<MessagePack>(
    ({ date: first }, { date: second }) => {
        return first > second ? -1 : second > first ? 1 : 0;
    }
);
