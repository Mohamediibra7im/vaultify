"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorFallback({
  title = "Error",
  message = "An unexpected error occurred.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <Card className="w-full max-w-md border border-red-500/20 bg-zinc-950/60 backdrop-blur-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">
              {title}
            </h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </CardContent>
        {onRetry && (
          <CardFooter className="justify-center pb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5 text-[10px] font-mono border-white/10 hover:bg-white/5"
            >
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
