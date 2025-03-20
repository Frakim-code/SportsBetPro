import { Game } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBettingSlip } from "../layout/betting-slip";
import { format } from "date-fns";

interface SportCardProps {
  game: Game;
}

export default function SportCard({ game }: SportCardProps) {
  const { addBet } = useBettingSlip();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{game.name}</CardTitle>
          <Badge
            variant={game.status === "upcoming" ? "outline" : "secondary"}
          >
            {game.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Start Time:</span>
            <span>{format(new Date(game.startTime), "MMM d, h:mm a")}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Odds:</span>
              <span className="text-xl font-bold">{game.odds}</span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => addBet(game)}
              disabled={game.status !== "upcoming"}
            >
              Add to Slip
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
