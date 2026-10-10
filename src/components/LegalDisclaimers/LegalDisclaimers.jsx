import React, { Component } from "react";
import "./LegalDisclaimers.css";

export default class LegalDisclaimers extends Component {
  render() {
    return (
      <section className="legal-disclaimers-section" aria-label="Legal Disclaimers">
        <div className="legal-disclaimers-container">
          <div className="legal-disclaimers-content">
            <p className="legal-disclaimer-p">
              ¹All credit sale plans are issued by Block, Inc. Not available to merchants in AL, DE, MO, MS, NH, and TN.
              Purchase amounts must be from $49 to $10,000. APR is 15%. Available plan lengths vary from 3, 6, 12, and/or
              24 month installments, depending on purchase amount. Sales tax, where applicable, will be due at checkout.
              All plans subject to credit approval and other factors.
            </p>

            <p className="legal-disclaimer-p">
              ²Block, Inc. is a financial services platform and not an FDIC-insured bank. FDIC deposit insurance coverage
              only protects against the failure of an FDIC-insured deposit institution. If you have a Square Checking
              account, up to $250,000 of your balance may be covered by FDIC insurance on a pass-through basis through
              Sutton Bank, Member FDIC, subject to aggregation of the account holder’s funds held at Sutton Bank and if
              certain conditions have been met. See <a href="#terms">Terms and Conditions</a>. Funds generated through
              Square’s payment processing services are generally available in the Square Checking account balance
              immediately after a payment is processed. Fund availability times may vary due to technical issues.
            </p>

            <p className="legal-disclaimer-p">
              Savings accounts are provided by Square Financial Services, Inc. Member FDIC.
            </p>

            <p className="legal-disclaimer-p">
              Square, the Square logo, Square Financial Services, Square Capital, and others are trademarks of Block,
              Inc. and/or its subsidiaries. Square Financial Services, Inc. is a wholly owned subsidiary of Block, Inc.
            </p>

            <p className="legal-disclaimer-p">
              All loans are issued by Square Financial Services, Inc. Actual fees depend upon payment card processing
              history, loan amount and other eligibility factors. A minimum payment is required and you must repay your
              loan as specified in the loan terms. Loan eligibility is not guaranteed. All loans are subject to credit
              approval.
            </p>
          </div>
        </div>
      </section>
    );
  }
}
