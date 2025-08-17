import { Route, Router, Switch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/layout/navigation";
import SignupPage from "@/pages/signup";
import ImportPage from "@/pages/import";
import Dashboard from "@/pages/dashboard";
import SEOPage from "@/pages/seo";
import RankTrackerPage from "@/pages/rank-tracker";
import SocialPage from "@/pages/social";
import AnalyticsPage from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import NotFoundPage from "@/pages/not-found";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Show signup page if not authenticated
  if (!user) {
    return <SignupPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/import" component={ImportPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/seo" component={SEOPage} />
          <Route path="/rank" component={RankTrackerPage} />
          <Route path="/social" component={SocialPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
