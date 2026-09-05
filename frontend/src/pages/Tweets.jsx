import { useState } from "react";
import { Button, IconButton } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { TextArea } from "../components/ui/Field.jsx";
import { ConfirmSheet } from "../components/ui/Sheet.jsx";
import { LoadingBlock } from "../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { createTweet, deleteTweet, getUserTweets, toggleTweetLike, updateTweet } from "../api/social.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatRelativeTime } from "../utils/format.js";

const MAX_LENGTH = 280;

export function TweetComposer({ onPosted }) {
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const remaining = MAX_LENGTH - content.length;

  async function onSubmit(event) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      await createTweet(trimmed);
      setContent("");
      await onPosted?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-line bg-surface p-4"
    >
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.fullName} id={user?._id} size="sm" />
        <div className="min-w-0 flex-1 space-y-2">
          <TextArea
            rows={3}
            value={content}
            maxLength={MAX_LENGTH}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's happening?"
            aria-label="Write a tweet"
          />
          <div className="flex items-center justify-between gap-3">
            <span
              className={`text-xs tabular-nums ${remaining < 20 ? "text-danger" : "text-muted"}`}
            >
              {remaining}
            </span>
            <Button type="submit" size="sm" loading={posting} disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function TweetRow({ tweet, isOwn, author, onChanged }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tweet.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    const content = draft.trim();
    if (!content || content === tweet.content) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await updateTweet(tweet._id, content);
      setEditing(false);
      await onChanged?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await deleteTweet(tweet._id);
      setConfirmingDelete(false);
      await onChanged?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function like() {
    try {
      await toggleTweetLike(tweet._id);
      toast.success("Like updated");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex gap-3">
        <Avatar src={author?.avatar} name={author?.fullName} id={tweet.owner} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
            <span className="font-semibold text-ink">
              {author?.fullName || "You"}
            </span>
            {author?.username && <span>@{author.username}</span>}
            <span>{formatRelativeTime(tweet.createdAt)}</span>
          </p>

          {editing ? (
            <div className="mt-2 space-y-2">
              <TextArea
                rows={3}
                value={draft}
                maxLength={MAX_LENGTH}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Edit tweet"
              />
              <div className="flex gap-2">
                <Button size="sm" loading={busy} onClick={save}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(tweet.content);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-ink">
              {tweet.content}
            </p>
          )}

          {!editing && (
            <div className="mt-2 flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={like}>
                <Icon name="heart" className="size-4" />
                Like
              </Button>
              {isOwn && (
                <>
                  <IconButton
                    label="Edit tweet"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                  >
                    <Icon name="edit" className="size-4" />
                  </IconButton>
                  <IconButton
                    label="Delete tweet"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Icon name="trash" className="size-4" />
                  </IconButton>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmSheet
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={remove}
        loading={busy}
        title="Delete this tweet?"
        message="This cannot be undone."
        confirmLabel="Delete"
      />
    </li>
  );
}

export function TweetList({ tweets, currentUserId, author, onChanged }) {
  if (tweets.length === 0) {
    return (
      <EmptyState
        icon="message"
        title="No tweets yet"
        message="Short posts show up here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {tweets.map((tweet) => (
        <TweetRow
          key={tweet._id}
          tweet={tweet}
          author={author}
          isOwn={String(tweet.owner) === String(currentUserId)}
          onChanged={onChanged}
        />
      ))}
    </ul>
  );
}

export default function Tweets() {
  useDocumentTitle("Tweets");

  const { user } = useAuth();
  // A user with no tweets gets a 404 from this endpoint; treat that as empty.
  const tweets = useAsync(
    () => (user?._id ? getUserTweets(user._id).catch(() => ({ docs: [] })) : Promise.resolve(null)),
    [user?._id]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Your tweets</h1>
        <p className="mt-1 text-sm text-muted">Short posts for your channel.</p>
      </div>

      <TweetComposer onPosted={tweets.reload} />

      {tweets.loading ? (
        <LoadingBlock label="Loading tweets" />
      ) : tweets.error ? (
        <ErrorState error={tweets.error} onRetry={tweets.reload} />
      ) : (
        <TweetList
          tweets={tweets.data?.docs ?? []}
          currentUserId={user?._id}
          author={user}
          onChanged={tweets.reload}
        />
      )}
    </div>
  );
}
