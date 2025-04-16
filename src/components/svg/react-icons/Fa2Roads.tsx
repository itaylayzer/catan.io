import { FaRoad } from "react-icons/fa";
import { IconType } from "react-icons/lib";

export const Fa2Roads: IconType = (props) => {
    return (
        <div className="relative" style={{ opacity: props.opacity ?? `1` }}>
            <FaRoad
                {...props}
                className="relative -top-1/8 -left-1/8"
                opacity={0.3}
            />
            <FaRoad
                {...props}
                className="absolute top-0 left-1/8"
                opacity={1}
            />
        </div>
    );
};
