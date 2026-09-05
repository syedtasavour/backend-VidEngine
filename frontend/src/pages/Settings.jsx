import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { TextInput } from "../components/ui/Field.jsx";
import { FilePicker } from "../components/ui/FilePicker.jsx";
import { changePassword, updateAccount, updateAvatar, updateCoverImage } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Settings() {
  useDocumentTitle("Settings");

  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(null);

  async function onSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateAccount(profile);
      if (updated) setUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords({ oldPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function onUploadImage(kind) {
    const file = kind === "avatar" ? avatarFile : coverFile;
    if (!file) return;

    setUploading(kind);
    try {
      // Both endpoints answer with the pre-update document, so re-read the
      // field we just changed from the response rather than trusting it whole.
      const updated =
        kind === "avatar" ? await updateAvatar(file) : await updateCoverImage(file);
      if (updated) setUser((prev) => ({ ...prev, ...updated }));
      if (kind === "avatar") setAvatarFile(null);
      else setCoverFile(null);
      toast.success(kind === "avatar" ? "Avatar updated" : "Cover image updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(null);
    }
  }

  async function onLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>

      <Section title="Appearance">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 text-left"
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} className="size-5 text-brand" />
          <span className="flex-1 text-sm font-medium text-ink">
            {theme === "dark" ? "Dark theme" : "Light theme"}
          </span>
          <span className="text-sm text-muted">Switch</span>
        </button>
      </Section>

      <Section title="Profile" description="Your name and email address.">
        <form onSubmit={onSaveProfile} className="space-y-4">
          <TextInput
            label="Full name"
            value={profile.fullName}
            onChange={(event) =>
              setProfile((prev) => ({ ...prev, fullName: event.target.value }))
            }
            autoComplete="name"
          />
          <TextInput
            label="Email"
            type="email"
            value={profile.email}
            onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
            autoComplete="email"
            inputMode="email"
          />
          <Button type="submit" loading={savingProfile} fullWidth className="sm:w-auto">
            Save profile
          </Button>
        </form>
      </Section>

      <Section title="Avatar" description="Shown next to your comments and videos.">
        {/* Side by side is too tight under ~400px, so stack until `sm`. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={user?.avatar} name={user?.fullName} id={user?._id} size="lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <FilePicker
              label="New avatar"
              aspect="aspect-square max-h-32"
              file={avatarFile}
              onSelect={setAvatarFile}
            />
            <Button
              disabled={!avatarFile}
              loading={uploading === "avatar"}
              onClick={() => onUploadImage("avatar")}
              fullWidth
              className="sm:w-auto"
            >
              Upload avatar
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Cover image" description="The banner across your channel page.">
        <div className="space-y-3">
          <FilePicker label="New cover image" file={coverFile} onSelect={setCoverFile} />
          <Button
            disabled={!coverFile}
            loading={uploading === "cover"}
            onClick={() => onUploadImage("cover")}
            fullWidth
            className="sm:w-auto"
          >
            Upload cover image
          </Button>
        </div>
      </Section>

      <Section title="Password">
        <form onSubmit={onChangePassword} className="space-y-4">
          <TextInput
            label="Current password"
            type="password"
            value={passwords.oldPassword}
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, oldPassword: event.target.value }))
            }
            autoComplete="current-password"
            required
          />
          <TextInput
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))
            }
            autoComplete="new-password"
            required
          />
          <Button type="submit" loading={savingPassword} fullWidth className="sm:w-auto">
            Change password
          </Button>
        </form>
      </Section>

      <Section title="Session">
        <Button variant="danger" onClick={onLogout} fullWidth className="sm:w-auto">
          <Icon name="logout" className="size-4" />
          Sign out
        </Button>
      </Section>
    </div>
  );
}
