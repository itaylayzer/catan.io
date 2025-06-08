import { cn } from "@/lib/utils";
import { useState } from "react";

export default function () {
    const [exit, setExit] = useState(false);


    return <div onClick={()=>{
        setExit(true);
    }} className={cn("outline rounded w-100 h-25 flex justify-center items-center", exit && "animate-[out] opacity-0 animation-duration-[1.5s]")}>hi</div>
}