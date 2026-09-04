import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { TextInput } from "../components/ui/Field.jsx";
import { FilePicker } from "../components/ui/FilePicker.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const USERNAME_PATTERN = /^[a-z0-9._-]{3,24}$/;

export default function Register() {
  useDocumentTitle("Create account");

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Tell us what to call you.";
    if (!USERNAME_PATTERN.test(form.username.trim().toLowerCase())) {
      next.username = "3-24 characters: letters, numbers, dot, dash, underscore.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    // The backend rejects a registration without an avatar, so catch it here.
    if (!avatar) next.avatar = "An avatar image is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({ ...form, avatar, coverImage });
      toast.success("Account created. Sign in to get started.");
      navigate("/login", { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">Create your channel</h1>
      <p className="mt-1 text-sm text-muted">It takes about a minute.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
        <TextInput
          label="Full name"
          value={form.fullName}
          onChange={update("fullName")}
          error={errors.fullName}
          autoComplete="name"
          required
        />
        <TextInput
          label="Username"
          value={form.username}
          onChange={update("username")}
          error={errors.username}
          hint="This becomes your channel address."
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
        />
        <TextInput
          label="Email"
          type="email"
          value={form.email}
          onChange={update("email")}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          required
        />
        <TextInput
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <FilePicker
          label="Avatar"
          required
          aspect="aspect-square max-h-44 mx-auto"
          hint="Square images work best"
          file={avatar}
          onSelect={setAvatar}
          error={errors.avatar}
        />

        <FilePicker
          label="Cover image"
          hint="Optional banner for your channel"
          file={coverImage}
          onSelect={setCoverImage}
        />

        {errors.form && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </>
  );
}
