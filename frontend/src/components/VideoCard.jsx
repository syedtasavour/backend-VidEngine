import { Link } from "react-router-dom";
import { Icon } from "./ui/Icon.jsx";
import { accentFromId, formatCount, formatDuration, formatRelativeTime } from "../utils/format.js";

/**
 * Thumbnails are optional on purpose: the `GET /videos` projection drops the
 * thumbnail field, so those cards render a generated poster instead.
 */
function Poster({ video }) {
  const hue = accentFromId(video._id ?? video.title ?? "");

  if (video.thumbnail) {
    return (
      <img
        src={video.thumbnail}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div
      className="flex size-full items-center justify-center"
      style={{
        background: `linear-gradient(135deg, oklch(0.5 0.16 ${hue}), oklch(0.4 0.12 ${
          (hue + 60) % 360
        }))`,
      }}
    >
      <Icon name="play" filled className="size-9 text-white/80" />
    </div>
  );
}

export function VideoCard({ video, badge, actions }) {
  const id = video._id;

  return (
    <article className="group">
      <Link
        to={`/watch/${id}`}
        state={{ video }}
        className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-surface-2"
      >
        <Poster video={video} />

        {video.duration != null && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-medium tabular-nums text-white">
            {formatDuration(video.duration)}
          </span>
        )}

        {video.isPublished === false && (
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
            Draft
          </span>
        )}

        {badge && (
          <span className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-xs font-medium text-on-brand">
            {badge}
          </span>
        )}
      </Link>

      <div className="mt-2.5 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2-safe text-sm font-semibold leading-snug text-ink">
            <Link to={`/watch/${id}`} state={{ video }}>
              {video.title || "Untitled video"}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
            <span>{formatCount(video.views ?? 0, "view")}</span>
            {video.createdAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatRelativeTime(video.createdAt)}</span>
              </>
            )}
          </p>
        </div>
        {actions}
      </div>
    </article>
  );
}

export function VideoGrid({ videos, renderActions }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
          actions={renderActions ? renderActions(video) : null}
        />
      ))}
    </div>
  );
}
