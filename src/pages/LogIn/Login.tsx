import * as React from "react";
import { Link } from "react-router-dom";
import {
  LoginPage,
  LoginMainFooterBandItem,
  LoginFooterItem,
  ListItem,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { FaInfo } from "react-icons/fa";
import ChRIS_Logo from "../../assets/images/chris-logo.png";
import ChRIS_Logo_inline from "../../assets/images/chris-logo-inline.png";
import LoginFormComponent from "./components/LoginForm";
import "./login.scss";

const loginTextDesc = `
ChRIS is a general-purpose, open source, distributed data and computation platform that connects a community of researchers, developers, and clinicians together.
`;

const FooterLinks = (
  <React.Fragment>
    <ListItem>
      <LoginFooterItem href="https://www.fnndsc.org/">
        Copyright © {new Date().getFullYear()} Boston Children&apos;s Hospital
        Fetal-Neonatal Neuroimaging and Developmental Science Center
      </LoginFooterItem>
    </ListItem>
  </React.Fragment>
);

const LogInPage: React.FC = () => {
  React.useEffect(() => {
    // Consider switching to react-helmet?
    document.title = "Log in into your ChRIS Account";
  }, []);

  const signUpForAccountMessage = (
    <LoginMainFooterBandItem>
      Need an account ? <Link to="/signup">Sign up</Link>
    </LoginMainFooterBandItem>
  );
  const forgotCredentials = (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <LoginMainFooterBandItem>
        Forgot username or password?
      </LoginMainFooterBandItem>
      <HelperText>
        <HelperTextItem icon={<FaInfo />}>
          <i>Please Contact a ChRIS admin for a new password</i>
        </HelperTextItem>
      </HelperText>
    </div>
  );
  return (
    <LoginPage
      className="login pf-background"
      loginTitle="Log in to your account"
      signUpForAccountMessage={signUpForAccountMessage}
      textContent={loginTextDesc}
      brandImgSrc={window.innerWidth < 1200 ? ChRIS_Logo_inline : ChRIS_Logo}
      brandImgAlt="ChRIS_logo"
      footerListItems={FooterLinks}
      forgotCredentials={forgotCredentials}
    >
      <LoginFormComponent />
    </LoginPage>
  );
};

export { LogInPage as LogIn };
