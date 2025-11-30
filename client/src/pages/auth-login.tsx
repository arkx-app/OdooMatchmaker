import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AuthLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((r) => r.json());

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("profile", JSON.stringify(response.profile));

      toast({ title: "Login successful!" });
      // Redirect directly to dashboard based on role
      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "partner") {
        navigate("/partner/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } catch (error) {
      toast({ title: "Login failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-8">Sign in to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <Link href="/" className="text-primary hover:underline">
            Go back and choose your role
          </Link>
        </p>
      </Card>
    </div>
  );
}
