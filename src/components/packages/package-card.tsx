import { Check, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PackageService {
    name: string;
    description?: string;
    items?: string[];
}

export interface PackageDef {
    id: string;
    name: string;
    price: number;
    description: string;
    saveAmount?: string;
    idealFor: string;
    color: string;
    services: PackageService[];
    outcome: string;
}

interface PackageCardProps {
    pkg: PackageDef;
    isSelected: boolean;
    onSelect: (pkg: PackageDef) => void;
}

export function PackageCard({ pkg, isSelected, onSelect }: PackageCardProps) {
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all border-2 relative h-full flex flex-col",
                isSelected ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(pkg)}
        >
            {pkg.saveAmount && (
                <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                        {pkg.saveAmount}
                    </Badge>
                </div>
            )}

            <CardHeader className={cn("pb-2", pkg.color)}>
                <CardTitle className="flex justify-between items-start gap-2">
                    <span className="text-xl font-bold">{pkg.name}</span>
                </CardTitle>
                <div className="mt-2">
                    <span className="text-2xl font-bold">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm font-normal">/month</span>
                </div>
                <CardDescription className="mt-1 line-clamp-2">
                    {pkg.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pt-4">
                <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Ideal For</p>
                    <p className="text-sm">{pkg.idealFor}</p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground border-b pb-1">What's Included:</p>
                    <ul className="space-y-2 text-sm">
                        {pkg.services.map((service, idx) => (
                            <li key={idx} className="flex gap-2 text-muted-foreground">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-foreground">{service.name}</strong>
                                    {service.items && (
                                        <ul className="list-disc list-inside pl-4 mt-1 text-xs text-muted-foreground/80">
                                            {service.items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-4 flex-col gap-2">
                <div className="w-full bg-accent/30 p-3 rounded-md">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Outcome</p>
                    <p className="text-xs italic text-muted-foreground">{pkg.outcome}</p>
                </div>
                <Button
                    className="w-full mt-2"
                    variant={isSelected ? "default" : "outline"}
                >
                    {isSelected ? 'Selected' : 'Select Package'}
                </Button>
            </CardFooter>
        </Card>
    );
}
