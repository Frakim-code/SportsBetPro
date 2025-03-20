import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiBinance } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/balance/deposit", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Deposit successful",
        description: `$${amount} has been added to your balance`,
      });
      onOpenChange(false);
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="binance">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="binance">Binance</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
          </TabsList>

          <TabsContent value="binance" className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <SiBinance className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="binance-amount">Amount (USD)</Label>
              <Input
                id="binance-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => depositMutation.mutate(amount)}
              disabled={!amount || depositMutation.isPending}
            >
              Pay with Binance
            </Button>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <svg className="h-12 w-12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.876-.03.2a.81.81 0 0 1-.794.68h-2.52c-.178 0-.264-.14-.226-.314l1.182-7.77c.008-.05.066-.314.31-.314h.5c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327" />
              </svg>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-amount">Amount (USD)</Label>
              <Input
                id="paypal-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => depositMutation.mutate(amount)}
              disabled={!amount || depositMutation.isPending}
            >
              Pay with PayPal
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
