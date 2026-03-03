import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Processes from "@/pages/Processes";
import ProcessDetail from "@/pages/ProcessDetail";
import EISForm from "@/pages/EISForm";
import Readiness from "@/pages/Readiness";

export default function App() {
    return (
        <TooltipProvider>
            <AppLayout>
                <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/processes" component={Processes} />
                    <Route path="/processes/:id" component={ProcessDetail} />
                    <Route path="/forms/:id" component={EISForm} />
                    <Route path="/readiness" component={Readiness} />
                    <Route>
                        <div className="flex h-[50vh] items-center justify-center">
                            <p className="text-muted-foreground">Page not found</p>
                        </div>
                    </Route>
                </Switch>
            </AppLayout>
            <Toaster />
        </TooltipProvider>
    );
}
