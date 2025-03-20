import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SiBinance } from "react-icons/si";
import { Gamepad2, Trophy } from "lucide-react";
import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to BetSport, {user?.username}!
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/sports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Sports Betting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bet on your favorite sports matches with competitive odds
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/casino">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6" />
                  Casino Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Try your luck with our exciting casino games
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SiBinance className="h-6 w-6" />
                  Binance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.876-.03.2a.81.81 0 0 1-.794.68h-2.52c-.178 0-.264-.14-.226-.314l1.182-7.77c.008-.05.066-.314.31-.314h.5c3.238 0 5.774-1.314 6.514-5.12.256-1.313.192-2.447-.3-3.327" />
                  </svg>
                  PayPal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Connect PayPal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}