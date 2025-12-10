import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Evaluations from "./pages/Evaluations";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import AITraining from "./pages/AITraining";
import ReportSettings from "./pages/ReportSettings";

import Questionnaires from "./pages/Questionnaires";
import QuestionnaireManage from "./pages/QuestionnaireManage";
import QuestionnaireEdit from "./pages/QuestionnaireEdit";
import QuestionnaireTake from "./pages/QuestionnaireTake";
import QuestionnaireResult from "./pages/QuestionnaireResult";
import ParentQuestionnairePublic from "./pages/ParentQuestionnairePublic";
import ParentLinks from "./pages/ParentLinks";
import AcademicRecord from "./pages/AcademicRecord";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <OfflineIndicator />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <TutorialProvider>
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
          </TutorialProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
