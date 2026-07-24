import React from "react";
import { Routes, Route } from "react-router-dom";

// layouts
import NonAuthLayout from "../Layout/NonAuthLayout";
import VerticalLayout from "../Layout/VerticalLayout/index";

import { authProtectedRoutes, publicRoutes } from "./routes";
import Error404 from "../Pages/Utility/Error404-Page";

const Index = () => {
  return (
    <Routes>
      <Route>
        {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
            key={idx}
            exact={true}
          />
        ))}
      </Route>

      <Route>
        {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<VerticalLayout>{route.component}</VerticalLayout>}
            key={idx}
            exact={true}
          />
        ))}
      </Route>
      <Route path="*" element={<Error404/>} />
    </Routes>
  );
};

export default Index;
