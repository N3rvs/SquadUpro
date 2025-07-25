'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ModeratorChatsPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/moderator">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Moderator Panel
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <MessageSquare /> Chat Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
