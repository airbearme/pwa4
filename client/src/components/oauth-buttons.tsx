import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
  isLoading?: boolean;
  onAuthSuccess?: () => void;
}

export function OAuthButtons({ isLoading = false, onAuthSuccess }: OAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Google Sign-In",
        description: "Redirecting to Google...",
      });
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Google Sign-In Failed",
        description: error?.message || "Unable to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Apple Sign-In",
        description: "Redirecting to Apple...",
      });
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      toast({
        title: "Apple Sign-In Failed",
        description: error?.message || "Unable to sign in with Apple",
        variant: "destructive",
      });
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Or continue with</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isAppleLoading}
                aria-label="Continue with Google"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <title>Google logo</title>
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.13-2.25-.38l-1.06.27c-.71.18-1.48.58-2.18 1.08-.5.5-.87 1.86-1.05 2.81-.2.95-.45 1.29-.45 2.54 0 .89.24 1.69.76 2.35 1.57-.19.69-.53 1.12-.82 1.67-.87 2.43-1.11 4.22-2.56 1.62-1.45 2.43-2.56 2.43-4.22 0-1.66-.81-2.43-2.56-1.62-1.45-2.43-2.56-4.22-2.56-.89 0-1.69.76-2.35 1.57-.29.55-.93.82-1.67.87-1.95.58-2.33 1.08-2.18 1.08-1.06.27-1.47-.38-2.25-.38-.78-.07-1.53-.13-2.25-.38l-1.06.27c-.71.18-1.48.58-2.18 1.08-.5.5-.87 1.86-1.05 2.81-.2.95-.45 1.29-.45 2.54 0 .89.24 1.69.76 2.35 1.57-.19.69-.53 1.12-.82 1.67-.87 2.43-1.11 4.22-2.56z"
                        fill="#4285F4"
                      />
                    </svg>
                    Google
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Continue with Google</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAppleSignIn}
                disabled={isLoading || isGoogleLoading || isAppleLoading}
                aria-label="Continue with Apple"
              >
                {isAppleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Apple...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <title>Apple logo</title>
                      <path
                        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 3.31l-2.36-1.4c-.27.16-.59.65-1.78.77-2.42.17l-2.47-.58c-.26.06-.54.06-1.06.06-1.79-.19-1.44-.23-2.84-.52-4.2-.52-1.36 0-2.76.29-4.2.52-.73.13-1.53.19-1.79.19l-2.47.58c-.64-.21-1.83-.61-2.42-.17l-2.36 1.4c-.86.86-2.22 2.07-3.05 3.31z"
                        fill="#000"
                      />
                    </svg>
                    Apple
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Continue with Apple</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Sign in with your social account for quick access</p>
          <p className="text-xs mt-1">
            We'll create your account automatically
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
