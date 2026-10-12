import React, { Component, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLoading from "@/components/Dashboard/DashboardLoading";

const HomePage = lazy(() => import("@/pages/HomePage"));
const SignIn = lazy(() => import("@/components/SignIn/SignIn"));
const SignUp = lazy(() => import("@/components/SignUp/SignUp"));
const VerifyEmail = lazy(() => import("@/components/VerifyEmail/VerifyEmail"));
const BusinessMatch = lazy(() => import("@/components/Onboarding/BusinessMatch/BusinessMatch"));
const BusinessMcc = lazy(() => import("@/components/Onboarding/BusinessMcc/BusinessMcc"));
const EstimatedRevenue = lazy(() => import("@/components/Onboarding/EstimatedRevenue/EstimatedRevenue"));
const SquareBanking = lazy(() => import("@/components/Onboarding/SquareBanking/SquareBanking"));
const Dashboard = lazy(() => import("@/components/Dashboard/Dashboard"));

export default class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Suspense fallback={<DashboardLoading message="Loading Square..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/signup/business-match" element={<BusinessMatch />} />
            <Route path="/signup/business-mcc-selection" element={<BusinessMcc />} />
            <Route path="/signup/estimated-annual-revenue" element={<EstimatedRevenue />} />
            <Route path="/signup/square-banking" element={<SquareBanking />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/items/library" element={<Dashboard />} />
            <Route path="/dashboard/items/library/new" element={<Dashboard />} />
            <Route path="/dashboard/items/library/:itemId" element={<Dashboard />} />
            <Route path="/dashboard/items/categories" element={<Dashboard />} />
            <Route path="/dashboard/items/categories/new" element={<Dashboard />} />
            <Route path="/dashboard/items/categories/:categoryId" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }
}
