import * as React from "react";
const SvgComponent = (props: React.SVGProps<SVGSVGElement>) => {
    if (props.fill) props.fill = undefined;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            id="b"
            width={800}
            height={800}
            fill="none"
            stroke="#000"
            strokeWidth={4}
            viewBox="0 0 48 48"
            {...props}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <g id="SVGRepo_iconCarrier">
                <path d="M36.117 24.076c1.646-1.355 2.826-3.394 1.522-6.29-2.82-6.26-11.93-1.43-19.292 0-8.122 1.58-12.579 4.74-10.04 8.01.983 1.268 2.44 1.985 3.856 2.388" />
                <path d="M31.04 14.721V7.464c-1.975-3.272-7.245-3.834-14.16-1.692-6.373 1.974-8.348 5.923-8.348 5.923 3.272 6.036 3.267 8.04 3.267 8.04M37.921 28.689c-2.933-11.098-9.644-9.469-16.772-7.687-7.446 1.862-10.36 5.19-8.612 12.354M37.094 29.764c.764-1.31 3.685-1.662 3.272 1.31-.314 2.252-1.708 2.404-2.445 1.885-.338 2.258-4.155 12.186-15.813 10.305-3.444-.555-5.483-1.974-6.647-3.697" />
                <path d="M18.197 32.716c-2.82-.3-3.31 2.67-4.419 2.633s-1.278-.752-1.733-2.388c0 0-1.388 2.594-.203 4.832 1.184 2.237 6.43 1.147 8.16-1.448 2.35 1.636 10.003 4.193 10.812-.846.201-1.257.015-2.342-.38-3.262-.335 1.645-1.369 2.81-2.986 2.36s-1.993-1.975-5.077-2.22" />
                <path d="M18.065 30.686c-.282 1.09.251 3.48 2.181 3.158 2.031-.338 2.614-1.824 1.73-3.497M25.906 22.581c1.56-.357 3.836.17 4.626 2.276M36.976 25.836l-1.819.6M35.157 28.184l2.403-.738M17.54 38.3c.563 1.505 4.49 4.597 6.907-.127M15.612 23.177c1.72-.07 2.529.89 2.529.89" />
                <ellipse cx={15.753} cy={27.815} rx={1.454} ry={1.788} />
                <ellipse cx={26.77} cy={27.268} rx={1.461} ry={1.788} />
            </g>
        </svg>
    );
};
export default SvgComponent;
