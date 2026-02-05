import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Children = lazy(() => import("./pages/Children"));
const Evaluations = lazy(() => import("./pages/Evaluations"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/Profile"));
const AITraining = lazy(() => import("./pages/AITraining"));
const ReportSettings = lazy(() => import("./pages/ReportSettings"));

const Questionnaires = lazy(() => import("./pages/Questionnaires"));
const QuestionnaireManage = lazy(() => import("./pages/QuestionnaireManage"));
const QuestionnaireEdit = lazy(() => import("./pages/QuestionnaireEdit"));
const QuestionnaireTake = lazy(() => import("./pages/QuestionnaireTake"));
const QuestionnaireResult = lazy(() => import("./pages/QuestionnaireResult"));
const ParentQuestionnairePublic = lazy(() => import("./pages/ParentQuestionnairePublic"));
const ParentLinks = lazy(() => import("./pages/ParentLinks"));
const AcademicRecord = lazy(() => import("./pages/AcademicRecord"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Sonner />
        <TutorialProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/children" element={<Children />} />
              <Route path="/evaluations" element={<Evaluations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/training" element={<AITraining />} />
              <Route path="/admin/report-settings" element={<ReportSettings />} />

              <Route path="/questionnaires" element={<Questionnaires />} />
              <Route path="/questionnaires/manage" element={<QuestionnaireManage />} />
              <Route path="/questionnaires/edit/:id" element={<QuestionnaireEdit />} />
              <Route path="/questionnaires/take/:id" element={<QuestionnaireTake />} />
              <Route path="/questionnaires/result/:id" element={<QuestionnaireResult />} />
              <Route path="/questionnaires/parents" element={<ParentQuestionnairePublic />} />
              <Route path="/parent-links" element={<ParentLinks />} />
              <Route path="/academic-record" element={<AcademicRecord />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TutorialProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
