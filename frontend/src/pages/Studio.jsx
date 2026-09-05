import { useState } from "react";
import { Button, IconButton } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { TextArea, TextInput, Toggle } from "../components/ui/Field.jsx";
import { FilePicker } from "../components/ui/FilePicker.jsx";
import { ConfirmSheet, Sheet } from "../components/ui/Sheet.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoGridSkeleton } from "../components/ui/Skeleton.jsx";
import { VideoCard } from "../components/VideoCard.jsx";
import {
  deleteVideo,
  getChannelStats,
  getChannelVideos,
  togglePublishStatus,
  updateVideo,
} from "../api/videos.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

export default function Studio() {
  useDocumentTitle("Studio");

  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [busy, setBusy] = useState(false);

  const videos = useAsync(
    () => (userId ? getChannelVideos(userId, { limit: 24 }) : Promise.resolve(null)),
    [userId]
  );
  const stats = useAsync(
    () => (userId ? getChannelStats(userId).catch(() => null) : Promise.resolve(null)),
    [userId]
  );

  const docs = videos.data?.docs ?? [];

  async function onTogglePublish(video) {
    const next = !video.isPublished;
    // Flip the badge immediately; the reload below reconciles with the server.
    videos.setData((prev) => ({
      ...prev,
      docs: prev.docs.map((item) =>
        item._id === video._id ? { ...item, isPublished: next } : item
      ),
    }));
    try {
      await togglePublishStatus(video._id, next);
      toast.success(next ? "Video published" : "Moved to drafts");
    } catch (error) {
      toast.error(error.message);
      await videos.reload();
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await deleteVideo(deletingVideo._id);
      setDeletingVideo(null);
      toast.success("Video deleted");
      await videos.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Studio</h1>
          <p className="mt-1 text-sm text-muted">Manage everything you have uploaded.</p>
        </div>
        <Button to="/upload" className="shrink-0">
          <Icon name="plus" className="size-4" />
          Upload
        </Button>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Videos", value: stats.data?.totalVideos ?? docs.length, icon: "film" },
          { label: "Likes", value: stats.data?.totalLikes ?? 0, icon: "heart" },
          { label: "Subscribers", value: stats.data?.subscribers ?? 0, icon: "user" },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-line bg-surface p-3.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon name={tile.icon} className="size-4" />
            </span>
            <dd className="mt-2.5 text-xl font-semibold tabular-nums text-ink">
              {formatCount(tile.value)}
            </dd>
            <dt className="text-xs text-muted">{tile.label}</dt>
          </div>
        ))}
      </dl>

      {videos.loading ? (
        <VideoGridSkeleton />
      ) : videos.error ? (
        <ErrorState error={videos.error} onRetry={videos.reload} />
      ) : docs.length === 0 ? (
        <EmptyState
          icon="film"
          title="Nothing uploaded yet"
          message="Publish your first video to see it here."
          action={{ label: "Upload a video", to: "/upload" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {docs.map((video) => (
            <div key={video._id} className="space-y-2">
              <VideoCard video={video} />
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onTogglePublish(video)}
                  className="flex-1 !justify-start"
                >
                  <Icon name={video.isPublished ? "eye" : "upload"} className="size-4" />
                  {video.isPublished ? "Published" : "Draft"}
                </Button>
                <IconButton
                  label={`Edit ${video.title}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingVideo(video)}
                >
                  <Icon name="edit" className="size-4" />
                </IconButton>
                <IconButton
                  label={`Delete ${video.title}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeletingVideo(video)}
                >
                  <Icon name="trash" className="size-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingVideo && (
        <EditVideoSheet
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSaved={async () => {
            setEditingVideo(null);
            await videos.reload();
            toast.success("Video updated");
          }}
        />
      )}

      <ConfirmSheet
        open={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        onConfirm={onDelete}
        loading={busy}
        title="Delete this video?"
        message={`"${deletingVideo?.title}" and its files will be permanently removed.`}
        confirmLabel="Delete video"
      />
    </div>
  );
}

function EditVideoSheet({ video, onClose, onSaved }) {
  const toast = useToast();
  const [title, setTitle] = useState(video.title ?? "");
  const [description, setDescription] = useState(video.description ?? "");
  const [isPublished, setIsPublished] = useState(Boolean(video.isPublished));
  const [thumbnail, setThumbnail] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateVideo(video._id, {
        title: title.trim(),
        description: description.trim(),
        isPublished,
        thumbnail,
      });
      await onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onClose={onClose} title="Edit video">
      <form onSubmit={submit} className="space-y-4">
        <TextInput
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
        />
        <TextArea
          label="Description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <FilePicker
          label="Replace thumbnail"
          hint="Leave empty to keep the current one"
          file={thumbnail}
          onSelect={setThumbnail}
        />
        <Toggle
          label="Published"
          description="Drafts stay hidden from your channel page."
          checked={isPublished}
          onChange={setIsPublished}
        />
        <Button type="submit" fullWidth size="lg" loading={saving}>
          Save changes
        </Button>
      </form>
    </Sheet>
  );
}
