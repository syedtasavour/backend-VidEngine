import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, IconButton } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { TextArea } from "../components/ui/Field.jsx";
import { Sheet } from "../components/ui/Sheet.jsx";
import { LoadingBlock } from "../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { CommentList } from "../components/CommentList.jsx";
import { getVideoById } from "../api/videos.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  toggleCommentLike,
  toggleVideoLike,
  updateComment,
} from "../api/social.js";
import { addVideoToPlaylist, getUserPlaylists } from "../api/playlists.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount, formatDate } from "../utils/format.js";

export default function Watch() {
  const { videoId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [commentDraft, setCommentDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [playlistSheetOpen, setPlaylistSheetOpen] = useState(false);

  const video = useAsync(() => getVideoById(videoId), [videoId]);
  const comments = useAsync(() => getVideoComments(videoId, { limit: 50 }), [videoId]);

  // `GET /videos/id/:id` strips _id and owner from its projection, so the card
  // we navigated from carries details this response cannot supply.
  const hint = state?.video ?? {};
  const data = video.data ? { ...hint, ...video.data } : hint;
  const commentDocs = comments.data?.docs ?? [];

  useDocumentTitle(data.title);

  const onLike = useCallback(async () => {
    setLiking(true);
    try {
      await toggleVideoLike(videoId);
      toast.success("Like updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLiking(false);
    }
  }, [videoId, toast]);

  async function onPostComment(event) {
    event.preventDefault();
    const content = commentDraft.trim();
    if (!content) return;

    setPosting(true);
    try {
      await addComment(videoId, content);
      setCommentDraft("");
      await comments.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  }

  async function onUpdateComment(commentId, content) {
    try {
      await updateComment(commentId, content);
      comments.setData((prev) => ({
        ...prev,
        docs: prev.docs.map((item) => (item._id === commentId ? { ...item, content } : item)),
      }));
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function onDeleteComment(commentId) {
    // Drop it locally first; a failure restores the list from the server.
    const snapshot = comments.data;
    comments.setData((prev) => ({
      ...prev,
      docs: prev.docs.filter((item) => item._id !== commentId),
    }));
    try {
      await deleteComment(commentId);
    } catch (error) {
      comments.setData(snapshot);
      toast.error(error.message);
    }
  }

  async function onLikeComment(commentId) {
    try {
      await toggleCommentLike(commentId);
      toast.success("Like updated");
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (video.loading && !hint.videoFile) return <LoadingBlock label="Loading video" />;
  if (video.error && !hint.videoFile) {
    return <ErrorState error={video.error} onRetry={video.reload} />;
  }

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8 lg:space-y-0">
      <div className="space-y-4">
        {/* Full-bleed on phones so the player uses the whole screen width. */}
        <div className="-mx-4 overflow-hidden bg-black sm:-mx-5 lg:mx-0 lg:rounded-2xl">
          {data.videoFile ? (
            <video
              key={data.videoFile}
              src={data.videoFile}
              poster={data.thumbnail}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center text-muted">
              Video unavailable
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start gap-2">
            <IconButton
              label="Go back"
              variant="ghost"
              size="sm"
              className="-ml-2 lg:hidden"
              onClick={() => navigate(-1)}
            >
              <Icon name="back" />
            </IconButton>
            <h1 className="min-w-0 flex-1 text-lg font-semibold leading-snug text-ink sm:text-xl">
              {data.title || "Untitled video"}
            </h1>
          </div>

          <p className="mt-1.5 text-sm text-muted">
            {formatCount(data.views ?? 0, "view")}
            {data.createdAt && ` · ${formatDate(data.createdAt)}`}
          </p>
        </div>

        {/* Action rail: scrolls sideways on narrow screens instead of wrapping. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          <Button variant="secondary" loading={liking} onClick={onLike} className="shrink-0">
            <Icon name="heart" className="size-4" />
            Like
          </Button>
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={() => setPlaylistSheetOpen(true)}
          >
            <Icon name="playlist" className="size-4" />
            Save
          </Button>
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={() => setDescriptionOpen(true)}
          >
            <Icon name="message" className="size-4" />
            Details
          </Button>
        </div>

        {data.description && (
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="line-clamp-2-safe whitespace-pre-wrap text-sm text-ink">
              {data.description}
            </p>
            <button
              type="button"
              onClick={() => setDescriptionOpen(true)}
              className="mt-1 text-sm font-medium text-brand"
            >
              Show more
            </button>
          </div>
        )}
      </div>

      <section className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
        <h2 className="text-base font-semibold text-ink">
          {formatCount(comments.data?.totalDocs ?? commentDocs.length, "comment")}
        </h2>

        <form onSubmit={onPostComment} className="mt-3 space-y-2">
          <TextArea
            rows={3}
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder="Add a comment…"
            aria-label="Add a comment"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={posting} disabled={!commentDraft.trim()}>
              Comment
            </Button>
          </div>
        </form>

        <div className="mt-2">
          {comments.loading ? (
            <LoadingBlock label="Loading comments" />
          ) : comments.error ? (
            <ErrorState error={comments.error} onRetry={comments.reload} />
          ) : commentDocs.length === 0 ? (
            <EmptyState
              icon="message"
              title="No comments yet"
              message="Be the first to say something."
            />
          ) : (
            <CommentList
              comments={commentDocs}
              currentUserId={user?._id}
              onUpdate={onUpdateComment}
              onDelete={onDeleteComment}
              onLike={onLikeComment}
            />
          )}
        </div>
      </section>

      <Sheet
        open={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
        title={data.title || "Video details"}
        description={
          data.createdAt ? `Published ${formatDate(data.createdAt)}` : undefined
        }
      >
        <p className="whitespace-pre-wrap text-sm text-ink">
          {data.description || "No description was provided for this video."}
        </p>
      </Sheet>

      <SaveToPlaylistSheet
        open={playlistSheetOpen}
        onClose={() => setPlaylistSheetOpen(false)}
        videoId={videoId}
      />
    </div>
  );
}

function SaveToPlaylistSheet({ open, onClose, videoId }) {
  const { user } = useAuth();
  const toast = useToast();
  const [savingId, setSavingId] = useState(null);

  const playlists = useAsync(
    () => (open && user?._id ? getUserPlaylists(user._id) : Promise.resolve(null)),
    [open, user?._id]
  );

  const docs = playlists.data?.docs ?? [];

  async function save(playlistId) {
    setSavingId(playlistId);
    try {
      await addVideoToPlaylist(playlistId, videoId);
      toast.success("Saved to playlist");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Save to playlist">
      {playlists.loading ? (
        <LoadingBlock label="Loading playlists" />
      ) : docs.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="No playlists yet"
          message="Create one from the Playlists page, then save videos into it."
          action={{ label: "Go to playlists", to: "/playlists" }}
        />
      ) : (
        <ul className="space-y-2">
          {docs.map((playlist) => (
            <li key={playlist._id}>
              <button
                type="button"
                disabled={savingId !== null}
                onClick={() => save(playlist._id)}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 text-left transition hover:border-brand disabled:opacity-60"
              >
                <Icon name="playlist" className="size-5 shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {playlist.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {formatCount(playlist.videos?.length ?? 0, "video")}
                  </span>
                </span>
                {savingId === playlist._id && <Icon name="check" className="size-5 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
