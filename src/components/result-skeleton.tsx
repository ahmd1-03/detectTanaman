import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ResultSkeleton() {
  return (
    <Card className="w-full max-w-4xl overflow-hidden shadow-2xl">
      <div className="grid md:grid-cols-2 animate-pulse">
        <Skeleton className="h-64 md:h-full w-full" />
        <div className="flex flex-col">
          <CardHeader>
            <Skeleton className="h-8 w-3/5 rounded-md" />
            <Skeleton className="h-5 w-2/5 rounded-md mt-2" />
          </CardHeader>

          <CardContent className="flex-grow space-y-6">
            <div>
              <Skeleton className="h-6 w-1/3 mb-4 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-1/3 mb-4 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/6 rounded-md" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/50 p-4">
            <Skeleton className="h-12 w-full rounded-md" />
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
