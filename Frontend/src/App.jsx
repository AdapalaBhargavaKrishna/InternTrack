import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddInterns from "./pages/AddInterns";
import ViewInterns from "./pages/ViewInterns";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddInterns />} />
          <Route path="/view" element={<ViewInterns />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
