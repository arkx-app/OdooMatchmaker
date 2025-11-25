import { useState, useEffect } from "react";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GuideStep {
  id: string;
  title: string;
  message: string;
  action?: string;
  target?: string;
}

interface GuideBotProps {
  steps: GuideStep[];
  onComplete?: () => void;
  isPartner?: boolean;
}

export default function GuideBot({ steps, onComplete, isPartner }: GuideBotProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setCompleted(true);
      onComplete?.();
    }
  }, [currentStep, steps.length, onComplete]);

  if (completed && !isOpen) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Floating Bot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-40 hover-elevate"
          data-testid="button-guide-bot"
          aria-label="Open guide"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Guide Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold">Guide Bot</h3>
              <p className="text-xs opacity-90">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              data-testid="button-close-guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">{step.title}</h4>
              <p className="text-muted-foreground text-sm">{step.message}</p>
            </div>

            {step.action && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
                <p className="text-blue-900 dark:text-blue-100">💡 {step.action}</p>
              </div>
            )}

            {/* Progress */}
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= currentStep ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1"
                data-testid="button-prev-step"
              >
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                onClick={() => setCurrentStep(currentStep + 1)}
                data-testid="button-next-step"
              >
                {currentStep === steps.length - 1 ? "Done" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
