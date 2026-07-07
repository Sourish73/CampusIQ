/**
 * src/App.jsx
 * Root component: wraps AuthProvider, sets up React Router.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage      from "./pages/HomePage";
import SearchPage    from "./pages/SearchPage";
import DetailPage    from "./pages/DetailPage";
import ComparePage   from "./pages/ComparePage";
import PredictorPage from "./pages/PredictorPage";
import ReviewPage    from "./pages/ReviewPage";
import SavedPage     from "./pages/SavedPage";
import ProfilePage   from "./pages/ProfilePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/"           element={<HomePage />} />
              <Route path="/search"     element={<SearchPage />} />
              <Route path="/college/:id" element={<DetailPage />} />
              <Route path="/compare"    element={<ComparePage />} />
              <Route path="/predictor"  element={<PredictorPage />} />
              <Route path="/reviews"    element={<ReviewPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login"      element={<LoginPage />} />
              <Route path="/register"   element={<RegisterPage />} />

              {/* Protected */}
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
