import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, IconButton } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { TextArea, TextInput } from "../components/ui/Field.jsx";
import { ConfirmSheet, Sheet } from "../components/ui/Sheet.jsx";
import { LoadingBlock } from "../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoCard } from "../components/VideoCard.jsx";
import {
  deletePlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../api/playlists.js";
import { getVideoById } from "../api/videos.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const playlist = useAsync(() => getPlaylistById(playlistId), [playlistId]);

  // The playlist stores video ids only, so each entry needs its own fetch.
  // A video that has since been deleted resolves to null and is filtered out.
  const videos = useAsync(async () => {
    const ids = playlist.data?.videos ?? [];
    if (ids.length === 0) return [];
    const results = await Promise.all(
      ids.map((id) =>
        getVideoById(id)
          .then((video) => ({ ...video, _id: id }))
          .catch(() => null)
      )
    );
    return results.filter(Boolean);
  }, [playlist.data]);

  useDocumentTitle(playlist.data?.name);

  async function onRemove(videoId) {
    setBusy(true);
    try {
      await removeVideoFromPlaylist(playlistId, videoId);
      await playlist.reload();
      toast.success("Removed from playlist");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await deletePlaylist(playlistId);
      toast.success("Playlist deleted");
      navigate("/playlists", { replace: true });
    } catch (error) {
      toast.error(error.message);
      setBusy(false);
    }
  }

  if (playlist.loading) return <LoadingBlock label="Loading playlist" />;
  if (playlist.error) return <ErrorState error={playlist.error} onRetry={playlist.reload} />;
  if (!playlist.data) return null;

  const { name, description, videos: videoIds = [] } = playlist.data;

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-2">
        <IconButton
          label="Go back"
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => navigate(-1)}
        >
          <Icon name="back" />
        </IconButton>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-ink">{name}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <p className="mt-1 text-xs text-muted">{formatCount(videoIds.length, "video")}</p>
        </div>

        <IconButton label="Edit playlist" variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Icon name="edit" />
        </IconButton>
        <IconButton
          label="Delete playlist"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingDelete(true)}
        >
          <Icon name="trash" />
        </IconButton>
      </header>

      {videoIds.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="This playlist is empty"
          message="Open any video and use Save to add it here."
        />
      ) : videos.loading ? (
        <LoadingBlock label="Loading videos" />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(videos.data ?? []).map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              actions={
                <IconButton
                  label={`Remove ${video.title} from playlist`}
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => onRemove(video._id)}
                >
                  <Icon name="close" className="size-4" />
                </IconButton>
              }
            />
          ))}
        </div>
      )}

      <EditPlaylistSheet
        open={editing}
        onClose={() => setEditing(false)}
        playlistId={playlistId}
        initial={{ name, description }}
        onSaved={async () => {
          setEditing(false);
          await playlist.reload();
          toast.success("Playlist updated");
        }}
      />

      <ConfirmSheet
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={onDelete}
        loading={busy}
        title="Delete this playlist?"
        message="The videos stay on the platform, only the playlist is removed."
        confirmLabel="Delete playlist"
      />
    </div>
  );
}

function EditPlaylistSheet({ open, onClose, playlistId, initial, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updatePlaylist(playlistId, { name: name.trim(), description: description.trim() });
      await onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Edit playlist">
      <form onSubmit={submit} className="space-y-4">
        <TextInput
          label="Name"
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
        <Button type="submit" fullWidth size="lg" loading={saving}>
          Save changes
        </Button>
      </form>
    </Sheet>
  );
}
