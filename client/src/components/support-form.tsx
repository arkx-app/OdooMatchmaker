import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  HelpCircle, Send, X, MessageCircle, 
  ChevronDown, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface SupportFormProps {
  userEmail?: string;
  userName?: string;
  userType?: "client" | "partner";
  variant?: "dialog" | "sheet" | "inline";
  trigger?: React.ReactNode;
}

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing Question" },
  { value: "matching", label: "Matching Help" },
  { value: "account", label: "Account Issue" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low - Can wait" },
  { value: "medium", label: "Medium - Need help soon" },
  { value: "high", label: "High - Urgent" },
];

function SupportFormContent({ 
  userEmail, 
  userName, 
  userType,
  onSuccess,
}: { 
  userEmail?: string; 
  userName?: string;
  userType?: string;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: userName || "",
    email: userEmail || "",
    subject: "",
    message: "",
    category: "general",
    priority: "medium",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userType: userType || "anonymous",
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit ticket");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();
    
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedSubject) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your message.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedMessage) {
      toast({
        title: "Message required",
        description: "Please describe your issue or question.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({
      ...formData,
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Message Sent</h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. Our team will review your message and get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-support-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            data-testid="input-support-email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger data-testid="select-support-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger data-testid="select-support-priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject"
          placeholder="Brief description of your issue"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          data-testid="input-support-subject"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Please describe your issue or question in detail..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          className="min-h-[120px]"
          data-testid="input-support-message"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          data-testid="button-submit-support"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function SupportFormDialog({ 
  userEmail, 
  userName, 
  userType,
  trigger,
}: SupportFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-open-support">
            <HelpCircle className="w-4 h-4 mr-2" />
            Need Help?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Have a question or need assistance? Send us a message and we'll get back to you.
          </DialogDescription>
        </DialogHeader>
        <SupportFormContent
          userEmail={userEmail}
          userName={userName}
          userType={userType}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function SupportFormSheet({ 
  userEmail, 
  userName, 
  userType,
  trigger,
}: SupportFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-open-support-sheet">
            <HelpCircle className="w-4 h-4 mr-2" />
            Need Help?
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </SheetTitle>
          <SheetDescription>
            Have a question or need assistance? Send us a message and we'll get back to you.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <SupportFormContent
            userEmail={userEmail}
            userName={userName}
            userType={userType}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SupportFormInline({ 
  userEmail, 
  userName, 
  userType,
}: SupportFormProps) {
  return (
    <SupportFormContent
      userEmail={userEmail}
      userName={userName}
      userType={userType}
    />
  );
}

export default function SupportForm(props: SupportFormProps) {
  const { variant = "dialog", ...rest } = props;

  switch (variant) {
    case "sheet":
      return <SupportFormSheet {...rest} />;
    case "inline":
      return <SupportFormInline {...rest} />;
    default:
      return <SupportFormDialog {...rest} />;
  }
}
