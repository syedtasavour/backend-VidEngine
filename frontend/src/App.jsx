import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell.jsx";
import { RedirectIfAuthed, RequireAuth } from "./components/RequireAuth.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { LoadingBlock } from "./components/ui/Spinner.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthLayout } from "./pages/AuthLayout.jsx";

// Route-level code splitting keeps the first paint small on mobile networks.
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Watch = lazy(() => import("./pages/Watch.jsx"));
const Upload = lazy(() => import("./pages/Upload.jsx"));
const Channel = lazy(() => import("./pages/Channel.jsx"));
const Tweets = lazy(() => import("./pages/Tweets.jsx"));
const Library = lazy(() => import("./pages/Library.jsx"));
const History = lazy(() => import("./pages/History.jsx"));
const Playlists = lazy(() => import("./pages/Playlists.jsx"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail.jsx"));
const Studio = lazy(() => import("./pages/Studio.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingBlock />}>
                <Routes>
                  <Route element={<RedirectIfAuthed />}>
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>
                  </Route>

                  <Route element={<RequireAuth />}>
                    <Route element={<AppShell />}>
                      <Route index element={<Home />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/watch/:videoId" element={<Watch />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/channel/:username" element={<Channel />} />
                      <Route path="/tweets" element={<Tweets />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/playlists" element={<Playlists />} />
                      <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
                      <Route path="/studio" element={<Studio />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
