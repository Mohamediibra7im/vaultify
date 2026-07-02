"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "This action cannot be undone. Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onClose]);

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog Panel */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-sm rounded-xl border border-white/5 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 pb-0">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${
                      isDanger
                        ? "bg-destructive/10 border-destructive/20"
                        : "bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4.5 w-4.5 ${
                        isDanger ? "text-destructive" : "text-amber-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground font-mono tracking-tight">
                      {title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={loading ? undefined : onClose}
                  className="p-1 rounded-md text-zinc-500 hover:text-foreground hover:bg-white/5 transition shrink-0"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pt-3 pb-5">
                <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                  {description}
                </p>

                {/* Terminal trace block */}
                <div className="mt-4 bg-black/50 rounded-lg border border-white/5 p-3 text-[9px] font-mono text-zinc-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isDanger ? "bg-destructive" : "bg-amber-500"
                      } animate-pulse`}
                    />
                    <span className="uppercase tracking-wider text-zinc-600">
                      {isDanger ? "Destructive Operation" : "Warning"}
                    </span>
                  </div>
                  <div className="text-zinc-600">
                    [SCOPE] resource.permanently.remove
                  </div>
                  <div className="text-zinc-600">
                    [STATUS] awaiting operator confirmation...
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-white/5 bg-black/20">
                <Button
                  ref={cancelRef}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-mono border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  size="sm"
                  className={`h-8 text-[10px] font-mono font-bold gap-1.5 ${
                    isDanger
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "bg-amber-500 hover:bg-amber-600 text-black"
                  }`}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
