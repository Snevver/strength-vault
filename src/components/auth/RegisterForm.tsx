import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, Loader2 } from "lucide-react";

export const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp, user, loading } = useAuth();

    useEffect(() => {
        if (user && !loading) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "Passwords do not match. Please try again.",
                variant: "destructive",
            });
            return;
        }
        
        if (password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }
        
        setIsLoading(true);

        const { error } = await signUp(email, password);

        if (error) {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Welcome!",
                description: "Account created. If required, check your email to confirm and then sign in.",
            });
            // signUp attempts immediate sign-in when possible; if that didn't happen,
            // keep the user on the page so they can follow email confirmation flow.
            navigate("/dashboard");
        }

        setIsLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Sign up to track your workouts and progress</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="btn-touch"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Choose a secure password (min. 6 characters)"
                                required
                                className="btn-touch"
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                className="btn-touch"
                            />
                        </div>
                        <Button type="submit" className="w-full btn-touch" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create account
                        </Button>
                        <div className="text-sm text-center mt-2">
                            <Link to="/login" className="text-primary hover:underline">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterForm;