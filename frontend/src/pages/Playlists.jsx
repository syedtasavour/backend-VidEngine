import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { TextArea, TextInput } from "../components/ui/Field.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";
import { LoadingBlock } from "../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { createPlaylist, getUserPlaylists } from "../api/playlists.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

export default function Playlists() {
  useDocumentTitle("Playlists");

  const { user } = useAuth();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const playlists = useAsync(
    () => (user?._id ? getUserPlaylists(user._id) : Promise.resolve(null)),
    [user?._id]
  );
  const docs = playlists.data?.docs ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Playlists</h1>
          <p className="mt-1 text-sm text-muted">Group videos into collections.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <Icon name="plus" className="size-4" />
          New
        </Button>
      </div>

      {playlists.loading ? (
        <LoadingBlock label="Loading playlists" />
      ) : playlists.error ? (
        <ErrorState error={playlists.error} onRetry={playlists.reload} />
      ) : docs.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="No playlists yet"
          message="Create one, then save videos into it from any video page."
          action={{ label: "Create a playlist", onClick: () => setCreating(true) }}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((playlist) => (
            <li key={playlist._id}>
              <Link
                to={`/playlists/${playlist._id}`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon name="playlist" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{playlist.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {formatCount(playlist.videos?.length ?? 0, "video")}
                    {playlist.description ? ` · ${playlist.description}` : ""}
                  </span>
                </span>
                <Icon name="chevron" className="size-5 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreatePlaylistSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={async () => {
          setCreating(false);
          toast.success("Playlist created");
          await playlists.reload();
        }}
      />
    </div>
  );
}

function CreatePlaylistSheet({ open, onClose, onCreated }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      // Both values travel in the path, so a slash would break the route.
      await createPlaylist(name.trim(), description.trim() || "No description");
      setName("");
      setDescription("");
      await onCreated();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New playlist">
      <form id="create-playlist" onSubmit={submit} className="space-y-4">
        <TextInput
          label="Name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
        />
        <TextArea
          label="Description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={200}
        />
        <Button type="submit" fullWidth size="lg" loading={saving} disabled={!name.trim()}>
          Create playlist
        </Button>
      </form>
    </Sheet>
  );
}
