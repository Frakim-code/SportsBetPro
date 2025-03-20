import { Game } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBettingSlip } from "../layout/betting-slip";

interface CasinoGameProps {
  game: Game;
}

export default function CasinoGame({ game }: CasinoGameProps) {
  const { addBet } = useBettingSlip();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{game.name}</CardTitle>
          <Badge variant={game.status === "active" ? "default" : "secondary"}>
            {game.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <span className="text-4xl">🎲</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Multiplier:</span>
              <span className="text-xl font-bold">{game.odds}x</span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => addBet(game)}
              disabled={game.status !== "active"}
            >
              Play Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
