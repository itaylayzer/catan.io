import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ReactNode } from "react";
export default function StateContainer({open, children}:{open:boolean, children:ReactNode | ReactNode[]}) {

    return <Accordion type="single" value={String(open)}>
        <AccordionItem value={String(true)}>
            <AccordionTrigger></AccordionTrigger>
            <AccordionContent>
                {children}
            </AccordionContent>
        </AccordionItem>
    </Accordion>
}