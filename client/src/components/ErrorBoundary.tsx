import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center p-6 rounded-2xl bg-card border border-border shadow-lg">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-sm text-muted-foreground mb-6">
              تم تسجيل المشكلة، يمكنك تحديث الصفحة أو العودة إلى الصفحة الرئيسية للمتابعة.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = "/home";
                }}
              >
                <Home className="w-4 h-4" />
                الرئيسية
              </Button>
              <Button
                className="gap-2"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
