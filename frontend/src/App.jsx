import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
=======
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VisitorDashboard from "./pages/visitor/VisitorDashboard";
<<<<<<< HEAD
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/visitor"
            element={
              <ProtectedRoute>
                <VisitorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default → Login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
=======
import EpassView from "./pages/EpassView";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/visitor"
              element={
                <ProtectedRoute>
                  <VisitorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/epass/:id" element={<EpassView />} />
            {/* Default → Login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
  );
}

export default App;
