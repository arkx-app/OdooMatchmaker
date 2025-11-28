import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Partner } from "@shared/schema";

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  partner: Partner | null;
}

export default function MatchModal({ open, onClose, partner }: MatchModalProps) {
  if (!partner) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-6"
          onClick={onClose}
          data-testid="modal-match"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-8 space-y-8 text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success-from/10 to-success-to/10" aria-hidden="true" />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10"
                onClick={onClose}
                data-testid="button-close-match"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="relative space-y-6">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="inline-flex"
                >
                  <Sparkles className="w-16 h-16 text-success-from" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-success-from to-success-to bg-clip-text text-transparent">
                    It's a Match!
                  </h2>
                  <p className="text-muted-foreground">
                    You and {partner.company} liked each other
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-client-from to-client-to flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">You</span>
                  </div>
                  <div className="flex items-center">
                    <Handshake className="w-8 h-8 text-success-from" />
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-partner-from to-partner-to flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {partner.company.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-success-from to-success-to hover:opacity-90"
                    size="lg"
                    data-testid="button-start-conversation"
                  >
                    Start Conversation
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onClose}
                    data-testid="button-keep-swiping"
                  >
                    Keep Swiping
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
