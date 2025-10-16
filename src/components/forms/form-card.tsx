import React from "react";
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function FormCard({
    cardTitle,
    children,
    cardDescription,
    className,
    ...props
}: React.ComponentProps<'div'> & {cardTitle: string; cardDescription?: string}) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                    {cardDescription && cardDescription !== '' && (
                        <CardDescription>{cardDescription}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    )
}