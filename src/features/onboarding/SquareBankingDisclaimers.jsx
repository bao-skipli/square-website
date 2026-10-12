import React, { PureComponent } from "react";
import { Link } from "react-router-dom";

export default class SquareBankingDisclaimers extends PureComponent {
  render() {
    return (
      <footer className="banking-disclaimers">
        <p>
          Block, Inc. is a financial services platform and not an FDIC-insured bank. Square
          Checking is provided by Sutton Bank, Member FDIC. Square Debit Card is issued by
          Sutton Bank, Member FDIC, pursuant to a license from Mastercard International
          Incorporated.
        </p>
        <p>
          Savings accounts are provided by Square Financial Services, Inc. Member FDIC.
        </p>
        <p>
          ¹Accrue annual percentage yield (APY) of 1.00% based on your total savings
          balance (inclusive of all folders and accrued unpaid interest). You may qualify
          for an increased APY of 4.25% if your total savings balance (inclusive of all
          folders and accrued unpaid interest) is at least $10,000 and settled into your
          account by 7:00 PM Mountain Time to qualify for the increased APY of 4.25% on a
          given day. See <a>Square Savings Deposit Account Terms</a> and the{" "}
          <a>Interest Rate Chart</a> for more information. APY subject to change, current as
          of 9/28/2026. No minimum deposit is required to open an account. Accounts will
          not be charged monthly fees. The Square Savings deposit sweep program distributes
          your funds among multiple FDIC-insured partner banks, meaning your eligible
          savings deposits have FDIC insurance coverage of up to $2.5 million. Pending
          balances are not subject to FDIC insurance.
        </p>
        <p>
          ²Instant availability of Square payments. Funds generated through Square's payment
          processing services are generally available in the Square Checking account
          balance immediately after a payment is processed. Fund availability times may vary
          due to technical issues. ACH transfer fund availability: Instant availability does
          not apply to funds added to the Square Checking account via ACH transfer. ACH
          credit transfers to your account may take 1–2 business days.
        </p>
        <p>
          ³Cash deposited into your Square Checking account is generally available in your
          checking account balance immediately after a deposit is processed. Fund
          availability times may vary due to technical issues. VanillaDirect Pay is
          provided by InComm Financial Services California, Inc. and by InComm Financial
          Services, Inc. (NMLS# 912772), which is licensed as a Money Transmitter by the
          New York State Department of Financial Services. Terms and conditions apply.
        </p>
        <p>
          To help the government fight the funding of terrorism and money laundering
          activities, federal law requires financial institutions to obtain, verify, and
          record information that identifies each person who opens an account.
        </p>
        <p>© 2026 Square, Inc. and/or Square Financial Services, Inc. All rights reserved.</p>
        <p>
          <Link to="/legal" style={{ color: "#111", textDecoration: "underline" }}>
            Privacy Notice
          </Link>
        </p>
      </footer>
    );
  }
}
