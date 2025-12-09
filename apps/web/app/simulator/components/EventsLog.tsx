"use client";

import { SimulationEvent } from "../types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface EventsLogProps {
    events: SimulationEvent[];
}

export function EventsLog({ events }: EventsLogProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No events emitted
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {events.map((event, index) => {
                const eventName = event.type.split("::").pop() || event.type;
                return (
                    <AccordionItem key={index} value={`event-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    #{event.sequenceNumber}
                                </Badge>
                                <span className="font-mono text-sm">{eventName}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-mono break-all">
                                    {event.type}
                                </p>
                                <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                                    {JSON.stringify(event.data, null, 2)}
                                </pre>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}
