import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import CasinoGame from "@/components/games/casino-game";
import BettingSlip from "@/components/layout/betting-slip";
import { Game } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useWebSocket } from "@/lib/ws";

export default function CasinoPage() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/casino"],
  });

  const connect = useWebSocket((state) => state.connect);
  
  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">Casino Games</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))
              ) : games?.map((game) => (
                <CasinoGame key={game.id} game={game} />
              ))}
            </div>
          </div>

          <div className="lg:w-80">
            <BettingSlip />
          </div>
        </div>
      </main>
    </div>
  );
}
