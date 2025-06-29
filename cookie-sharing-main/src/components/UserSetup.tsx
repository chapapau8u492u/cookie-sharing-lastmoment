import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateUsername, setStoredUsername } from "@/lib/auth";
import { registerUser, checkUserExists } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UserSetupProps {
  onSetupComplete: (username: string) => void;
}

const UserSetup = ({ onSetupComplete }: UserSetupProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      toast({
        variant: "destructive",
        title: "Invalid username",
        description:
          "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
      });
      return;
    }

    setLoading(true);

    try {
      const exists = await checkUserExists(username);

      if (exists) {
        // User exists, just store locally
        setStoredUsername(username);
        onSetupComplete(username);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${username}`,
        });
      } else {
        // Register new user
        const success = await registerUser(username);
        if (success) {
          setStoredUsername(username);
          onSetupComplete(username);
          toast({
            title: "Account created!",
            description: `Welcome to Last Moment Tuition's Session Manager, ${username}!`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Failed to create account. Please try again.",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Last Moment Tuitions Session Manager
          </CardTitle>
          <CardDescription>
            Enter your username to get started with session sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !username.trim()}
            >
              {loading ? "Setting up..." : "Get Started"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSetup;
