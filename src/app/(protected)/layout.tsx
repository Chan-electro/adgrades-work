import { MigratedAppLayout } from '@/components/layout/MigratedAppLayout';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MigratedAppLayout>
            {children}
        </MigratedAppLayout>
    );
}
