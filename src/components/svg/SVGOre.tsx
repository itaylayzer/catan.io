import * as React from "react";
const SvgComponent = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={800}
        height={800}
        viewBox="0 0 16 16"
        strokeWidth={0}
        style={{ scale: "0.8" }}
        {...props}
    >
        <path d="m6.516 2.612 2.809.938.734 2.934.188.75.644.428 2.238 1.494.605 4.844H2.441l.331-1.65 1.125-.562.875-.438.191-.959 1.553-7.779M5 0 3 10l-2 1-1 5h16l-1-8-3-2-1-4-6-2z" />
    </svg>
);
export default SvgComponent;
