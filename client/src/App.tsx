import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ScreensPage } from './pages/admin/ScreensPage';
import { TemplatesPage } from './pages/admin/TemplatesPage';
import { BrandsPage } from './pages/admin/BrandsPage';
import { ReviewSourcesPage } from './pages/admin/ReviewSourcesPage';
import { SyncLogsPage } from './pages/admin/SyncLogsPage';
import { ProductImportPage } from './pages/admin/ProductImportPage';
import { ScreenEditorPage } from './pages/admin/ScreenEditorPage';
import { TvScreenPage } from './tv/TvScreenPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* TV-schermen — publiek via screen key */}
          <Route path="/screens/:slug" element={<TvScreenPage />} />

          {/* Stijleditor — beveiligd, eigen full-screen layout */}
          <Route
            path="/admin/screens/:id/edit"
            element={
              <ProtectedRoute>
                <ScreenEditorPage />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin — beveiligd */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="screens" element={<ScreensPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="review-sources" element={<ReviewSourcesPage />} />
            <Route path="sync-logs" element={<SyncLogsPage />} />
            <Route path="products" element={<ProductImportPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
