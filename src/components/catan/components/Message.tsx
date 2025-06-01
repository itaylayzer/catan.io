export function Message({
    message,
    name,
    time,
}: {
    time: string;
    name: string;
    message: string;
}) {
    return (
        <div className="flex gap-1 font-[Rubik]">
            <p className="font-extralight text-gray-400 opacity-75">{time}</p>
            <p className="font-medium font-[Rubik] mr-1">{name}</p>
            <p>{message}</p>
        </div>
    );
}
