import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center p-6">
                    <Card className="w-full max-w-md bg-black/40 border-red-500/50 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-400">
                                <AlertCircle className="mr-2 h-5 w-5" />
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                We've encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                            <div className="bg-red-500/10 p-3 rounded-md text-xs font-mono text-red-200/70 overflow-x-auto">
                                {this.state.error?.message}
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center space-x-2 bg-[#10b981] text-white py-2 rounded-md hover:opacity-90 transition-opacity"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                <span>Reload Application</span>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
