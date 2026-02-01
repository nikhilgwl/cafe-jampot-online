import React, { useState } from "react";
import { MessageSquare, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FeedbackCategory = "product" | "website" | "service";

const MAX_WORDS = 100;

const FeedbackForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const wordCount = feedbackText.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > MAX_WORDS;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!category) {
      toast({
        title: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!feedbackText.trim()) {
      toast({
        title: "Please enter your feedback",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Feedback too long",
        description: `Please limit to ${MAX_WORDS} words.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        category,
        feedback_text: feedbackText.trim(),
      });

      if (error) {
        console.error("Feedback error:", error);
        toast({
          title: "Failed to submit feedback",
          description: "Please try again later.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setCategory("");
          setFeedbackText("");
        }, 2000);
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCategory("");
      setFeedbackText("");
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Feedback</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Anonymous Feedback
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted anonymously.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as FeedbackCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product / Food</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback">Your Feedback</Label>
                <span
                  className={`text-xs ${
                    isOverLimit ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {wordCount}/{MAX_WORDS} words
                </span>
              </div>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts, suggestions, or concerns..."
                value={feedbackText}
                onChange={handleTextChange}
                rows={5}
                className={isOverLimit ? "border-destructive" : ""}
              />
              {isOverLimit && (
                <p className="text-xs text-destructive">
                  Please keep your feedback under {MAX_WORDS} words.
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Your feedback is completely anonymous. We cannot identify who submitted it.
            </p>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isOverLimit}
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Feedback
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
