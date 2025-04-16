import * as React from "react";
const SVGWheat = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        id="Layer_1"
        width={800}
        height={800}
        data-name="Layer 1"
        viewBox="0 0 24 24"
        {...props}
        fill={"none"}
        strokeWidth={2}
    >
        <defs></defs>
        <path d="m12.004 2.374 1.336 1.337a3.78 3.78 0 0 1 0 5.346l-1.336 1.336-1.344-1.344a3.78 3.78 0 0 1 .008-5.338l1.336-1.337Z" />
        <path d="M17.67 8.27v1.89a3.78 3.78 0 0 1-3.73 3.77h-1.89v-1.88a3.78 3.78 0 0 1 3.73-3.78h1.89ZM6.34 8.27h1.88A3.78 3.78 0 0 1 12 12v1.89h-1.89a3.78 3.78 0 0 1-3.78-3.78V8.27h.01ZM17.66 13.94v1.89a3.78 3.78 0 0 1-3.78 3.78H12v-1.89a3.78 3.78 0 0 1 3.77-3.78h1.89Z" />
        <path d="M6.34 13.94h1.88A3.78 3.78 0 0 1 12 17.71v1.89h-1.89a3.78 3.78 0 0 1-3.78-3.78v-1.88h.01ZM12 23.38V10.16" />
    </svg>
);
export default SVGWheat;
