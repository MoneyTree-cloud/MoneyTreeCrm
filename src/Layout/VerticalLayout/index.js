import React from "react";

// import Components
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import {
  withLoadData,
  withPasswordChange,
  withProtected,
} from "../../Routes/AuthProtected";
import SuspenseWrapper from "../SuspenseWrapper";

const Layout = ({ children }) => {
  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Header />
        <Sidebar />
        <div className="main-content">
          <SuspenseWrapper>{children}</SuspenseWrapper>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
};

export default withProtected(withPasswordChange(withLoadData(Layout)));
