import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing         from "./pages/Landing";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";
import Dashboard       from "./pages/Dashboard";
import Reviewer        from "./pages/Reviewer";
import Collections     from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";

/* ─────────────────────────────────────────────────────────────────
   ProtectedRoute
   • While auth is still loading from localStorage → show nothing
     (avoids a flash-redirect on refresh when user IS logged in)
   • If not logged in → redirect to /login, remembering where they
     were trying to go via the `state.from` field
   ───────────────────────────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    // Render a minimal dark-screen while we hydrate from localStorage
    return (
      <div style={{
        minHeight: "100vh",
        background: "#07071a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "#7c3aed",
          boxShadow: "0 0 20px #7c3aed",
          animation: "pulse 1s ease-in-out infinite",
        }} />
        <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.8);opacity:1}}`}</style>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"       element={<Landing />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes — require login */}
      <Route path="/library"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/review"           element={<ProtectedRoute><Reviewer /></ProtectedRoute>} />
      <Route path="/collections"      element={<ProtectedRoute><Collections /></ProtectedRoute>} />
      <Route path="/collections/:id"  element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;