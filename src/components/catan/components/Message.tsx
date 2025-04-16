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
        <p>
            <span className="font-extralight text-gray-400">[{time}]</span>{" "}
            {"<"}
            <span>{name}</span>
            {">"} {message}
        </p>
    );
}
