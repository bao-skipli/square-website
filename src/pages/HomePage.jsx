import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { subscribeAuth } from "@/firebase/authService";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Hardware from "@/components/Hardware/Hardware";
import PointOfSale from "@/components/PointOfSale/PointOfSale";
import BuiltForEveryIndustry from "@/components/BuiltForEveryIndustry/BuiltForEveryIndustry";
import SquareAi from "@/components/SquareAi/SquareAi";
import Pricing from "@/components/Pricing/Pricing";
import MakeYourNextMove from "@/components/sections/MakeYourNextMove/MakeYourNextMove";
import Newsletter from "@/components/Newsletter/Newsletter";
import LegalDisclaimers from "@/components/LegalDisclaimers/LegalDisclaimers";
import Footer from "@/components/Footer/Footer";

export default class HomePage extends Component {
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
