import { create } from 'zustand';
import { Game } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BetSlip {
  game: Game;
  amount: string;
}

interface BettingSlipStore {
  bets: BetSlip[];
  addBet: (game: Game) => void;
  removeBet: (gameId: string) => void;
  clearSlip: () => void;
}

export const useBettingSlip = create<BettingSlipStore>((set) => ({
  bets: [],
  addBet: (game) => set((state) => ({
    bets: state.bets.some(bet => bet.game.id === game.id)
      ? state.bets
      : [...state.bets, { game, amount: "" }]
  })),
  removeBet: (gameId) => set((state) => ({
    bets: state.bets.filter(bet => bet.game.id !== gameId)
  })),
  clearSlip: () => set({ bets: [] })
}));

export default function BettingSlip() {
  const { bets, removeBet, clearSlip } = useBettingSlip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const placeBetMutation = useMutation({
    mutationFn: async (bet: { gameId: string; amount: string; odds: string; type: string }) => {
      const res = await apiRequest("POST", "/api/bets", bet);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Bet placed successfully",
        description: "Good luck!",
      });
      clearSlip();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place bet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalAmount = Object.values(amounts)
    .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);

  if (bets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Slip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center">
            Your betting slip is empty
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Betting Slip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bets.map((bet) => (
          <div key={bet.game.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{bet.game.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBet(bet.game.id)}
              >
                ✕
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min="0"
                placeholder="Amount"
                value={amounts[bet.game.id] || ""}
                onChange={(e) => setAmounts(prev => ({
                  ...prev,
                  [bet.game.id]: e.target.value
                }))}
              />
              <span className="text-sm">Odds: {bet.game.odds}</span>
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex justify-between mb-4">
            <span>Total Stake:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <Button
            className="w-full"
            disabled={
              totalAmount <= 0 ||
              !user ||
              parseFloat(user.balance) < totalAmount ||
              placeBetMutation.isPending
            }
            onClick={() => {
              bets.forEach(bet => {
                const amount = amounts[bet.game.id];
                if (!amount) return;
                
                placeBetMutation.mutate({
                  gameId: bet.game.id,
                  amount,
                  odds: bet.game.odds,
                  type: bet.game.type
                });
              });
            }}
          >
            Place Bets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
