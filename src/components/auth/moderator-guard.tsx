
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

export function ModeratorGuard({ children }: { children: ReactNode }) {
    const { claims, loading } = useAuth();
    const router = useRouter();

    const isModerator = claims?.role === 'moderator' || claims?.role === 'admin';

    useEffect(() => {
        if (!loading && !isModerator) {
            router.replace('/dashboard');
        }
    }, [isModerator, loading, router]);

    if (loading || !isModerator) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
