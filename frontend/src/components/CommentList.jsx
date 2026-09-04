import { useState } from "react";
import { Avatar } from "./ui/Avatar.jsx";
import { Button, IconButton } from "./ui/Button.jsx";
import { Icon } from "./ui/Icon.jsx";
import { TextArea } from "./ui/Field.jsx";
import { formatRelativeTime } from "../utils/format.js";

function CommentRow({ comment, isOwn, onUpdate, onDelete, onLike }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  async function save() {
    const content = draft.trim();
    if (!content || content === comment.content) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onUpdate(comment._id, content);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-3 py-3">
      <Avatar
        src={comment.ownerDetails?.avatar}
        name={comment.ownerDetails?.fullName || "User"}
        id={comment.owner}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
          <span className="font-semibold text-ink">
            {comment.ownerDetails?.username ? `@${comment.ownerDetails.username}` : "A viewer"}
          </span>
          <span>{formatRelativeTime(comment.createdAt)}</span>
        </p>

        {editing ? (
          <div className="mt-2 space-y-2">
            <TextArea
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Edit comment"
            />
            <div className="flex gap-2">
              <Button size="sm" loading={busy} onClick={save}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(comment.content);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">{comment.content}</p>
        )}

        {!editing && (
          <div className="mt-1.5 flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => onLike(comment._id)}>
              <Icon name="heart" className="size-4" />
              Like
            </Button>
            {isOwn && (
              <>
                <IconButton
                  label="Edit comment"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                >
                  <Icon name="edit" className="size-4" />
                </IconButton>
                <IconButton
                  label="Delete comment"
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(comment._id)}
                >
                  <Icon name="trash" className="size-4" />
                </IconButton>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function CommentList({ comments, currentUserId, onUpdate, onDelete, onLike }) {
  return (
    <ul className="divide-y divide-line">
      {comments.map((comment) => (
        <CommentRow
          key={comment._id}
          comment={comment}
          isOwn={String(comment.owner) === String(currentUserId)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onLike={onLike}
        />
      ))}
    </ul>
  );
}
