import React, { Component, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardLoading from "@/components/Dashboard/DashboardLoading";

const SignIn = lazy(() => import("@/components/SignIn/SignIn"));
const SignUp = lazy(() => import("@/components/SignUp/SignUp"));
const VerifyEmail = lazy(() => import("@/components/VerifyEmail/VerifyEmail"));
const BusinessMatch = lazy(() => import("@/components/Onboarding/BusinessMatch/BusinessMatch"));
const BusinessMcc = lazy(() => import("@/components/Onboarding/BusinessMcc/BusinessMcc"));
const EstimatedRevenue = lazy(() => import("@/components/Onboarding/EstimatedRevenue/EstimatedRevenue"));
const SquareBanking = lazy(() => import("@/components/Onboarding/SquareBanking/SquareBanking"));
const Dashboard = lazy(() => import("@/components/Dashboard/Dashboard"));
const StorefrontPage = lazy(() => import("@/storefront/StorefrontPage"));
const ImageUploader = lazy(() => import("@/components/ImageUploader"));

function getCustomDomainHostname() {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;
  if (!hostname) return null;
  const isLocalOrPlatform =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".firebaseapp.com") ||
    hostname.endsWith(".web.app") ||
    hostname.includes("ngrok") ||
    hostname.includes("run.app");
  if (isLocalOrPlatform) return null;
  return hostname;
}

export default class App extends Component {
  render() {
    const customHostname = getCustomDomainHostname();

    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              customHostname ? (
                <Suspense fallback={null}>
                  <StorefrontPage customHostname={customHostname} />
                </Suspense>
              ) : (
                <HomePage />
              )
            }
          />
          <Route
            path="/signin"
            element={
              <Suspense fallback={null}>
                <SignIn />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={null}>
                <SignUp />
              </Suspense>
            }
          />
          <Route
            path="/verify"
            element={
              <Suspense fallback={null}>
                <VerifyEmail />
              </Suspense>
            }
          />
          <Route
            path="/signup/business-match"
            element={
              <Suspense fallback={null}>
                <BusinessMatch />
              </Suspense>
            }
          />
          <Route
            path="/signup/business-mcc-selection"
            element={
              <Suspense fallback={null}>
                <BusinessMcc />
              </Suspense>
            }
          />
          <Route
            path="/signup/estimated-annual-revenue"
            element={
              <Suspense fallback={null}>
                <EstimatedRevenue />
              </Suspense>
            }
          />
          <Route
            path="/signup/square-banking"
            element={
              <Suspense fallback={null}>
                <SquareBanking />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/library"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/library/new"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/library/:itemId"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/categories"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/categories/new"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/categories/:categoryId"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/modifiers"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/modifiers/new"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/items/modifiers/:setId"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/store-setup/review"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <Suspense fallback={<DashboardLoading fullScreen message="Loading Square..." />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/store/:slug"
            element={
              <Suspense fallback={null}>
                <StorefrontPage />
              </Suspense>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
