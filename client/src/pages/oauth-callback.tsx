import { useEffect } from "react";
import { useNavigate } from "wouter";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await getSupabaseClient().auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Authentication Failed",
            description: error.message || "Unable to complete authentication",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (data.session?.user) {
          toast({
            title: "Authentication Successful",
            description: "You have been signed in successfully",
          });
          
          // Redirect to dashboard or home
          const userRole = data.session.user.user_metadata?.role || "user";
          if (userRole === "driver") {
            navigate("/driver-dashboard");
          } else {
            navigate("/map");
          }
        } else {
          toast({
            title: "Authentication Failed",
            description: "No session found",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "An error occurred during authentication",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
