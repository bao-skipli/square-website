import React, { Component } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { subscribeAuth } from "./firebase/authService";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Hardware from "./components/Hardware/Hardware";
import PointOfSale from "./components/PointOfSale/PointOfSale";
import BuiltForEveryIndustry from "./components/BuiltForEveryIndustry/BuiltForEveryIndustry";
import SquareAi from "./components/SquareAi/SquareAi";
import Pricing from "./components/Pricing/Pricing";
import MakeYourNextMove from "./components/sections/MakeYourNextMove/MakeYourNextMove";
import Newsletter from "./components/Newsletter/Newsletter";
import LegalDisclaimers from "./components/LegalDisclaimers/LegalDisclaimers";
import Footer from "./components/Footer/Footer";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import VerifyEmail from "./components/VerifyEmail/VerifyEmail";
import BusinessMatch from "./components/Onboarding/BusinessMatch/BusinessMatch";
import BusinessMcc from "./components/Onboarding/BusinessMcc/BusinessMcc";
import EstimatedRevenue from "./components/Onboarding/EstimatedRevenue/EstimatedRevenue";
import SquareBanking from "./components/Onboarding/SquareBanking/SquareBanking";
import Dashboard from "./components/Dashboard/Dashboard";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToVerify: false,
    };
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth((user) => {
      if (user && !user.emailVerified) {
        this.setState({ redirectToVerify: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  render() {
    if (this.state.redirectToVerify) {
      return <Navigate to="/verify" replace />;
    }

    return (
      <main>
        <Header />
        <Hero />
        <Hardware />
        <PointOfSale />
        <BuiltForEveryIndustry />
        <SquareAi />
        <Pricing />
        <MakeYourNextMove />
        <Newsletter />
        <LegalDisclaimers />
        <Footer />
      </main>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <BrowserRouter>
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
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
