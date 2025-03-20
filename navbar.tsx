import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentDialog } from "../payments/payment-dialog";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              BetSport
            </span>
          </Link>
          <div className="flex gap-6 md:gap-10">
            <Link href="/sports" className="flex items-center text-sm font-medium">
              Sports
            </Link>
            <Link href="/casino" className="flex items-center text-sm font-medium">
              Casino
            </Link>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-sm">
                Balance: ${user.balance}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentOpen(true)}
              >
                Deposit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </nav>
  );
}
