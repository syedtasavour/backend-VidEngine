import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { TextInput } from "../components/ui/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function Login() {
  useDocumentTitle("Sign in");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to keep watching and posting.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
        <TextInput
          label="Username or email"
          value={form.identifier}
          onChange={update("identifier")}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          required
        />
        <TextInput
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          autoComplete="current-password"
          required
        />

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="font-medium text-brand">
          Create an account
        </Link>
      </p>
    </>
  );
}
