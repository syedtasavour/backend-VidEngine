import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoGridSkeleton } from "../components/ui/Skeleton.jsx";
import { VideoCard, VideoGrid } from "../components/VideoCard.jsx";
import { getChannelStats, getChannelVideos } from "../api/videos.js";
import { getLikedVideos } from "../api/social.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon name={icon} className="size-4" />
      </span>
      <p className="mt-2.5 text-xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export default function Home() {
  useDocumentTitle("Home");
  const { user } = useAuth();
  const userId = user?._id;

  const videos = useAsync(() => getChannelVideos(userId, { limit: 8 }), [userId]);
  const liked = useAsync(() => getLikedVideos({ limit: 4 }), [userId]);
  // A channel with no videos yet makes this endpoint fail, which is not an
  // error worth surfacing — the tiles simply fall back to zeroes.
  const stats = useAsync(() => getChannelStats(userId).catch(() => null), [userId]);

  const myVideos = videos.data?.docs ?? [];
  const likedVideos = (liked.data?.docs ?? [])
    .map((entry) => entry.likedVideos)
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-brand p-5 text-on-brand sm:p-7">
        <p className="text-sm opacity-80">Welcome back</p>
        <h1 className="mt-0.5 text-2xl font-semibold sm:text-3xl">
          {user?.fullName?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-2 max-w-md text-sm opacity-85">
          Publish a new video, catch up on what you liked, or look up a channel by
          its username.
        </p>
        {/* Both buttons sit on the brand surface, so they are tinted against
            it rather than reusing the page-level button variants. */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            to="/upload"
            size="md"
            className="!bg-on-brand !text-brand hover:!brightness-95"
          >
            <Icon name="upload" className="size-4" />
            Upload video
          </Button>
          <Button
            to="/search"
            size="md"
            className="!border !border-on-brand/40 !bg-transparent !text-on-brand hover:!bg-on-brand/15"
          >
            <Icon name="search" className="size-4" />
            Find a channel
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatTile icon="film" label="Videos" value={formatCount(stats.data?.totalVideos ?? 0)} />
        <StatTile icon="heart" label="Likes" value={formatCount(stats.data?.totalLikes ?? 0)} />
        <StatTile icon="user" label="Subscribers" value={formatCount(stats.data?.subscribers ?? 0)} />
      </section>

      <section>
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Your videos</h2>
          <Link to="/studio" className="text-sm font-medium text-brand">
            Open studio
          </Link>
        </header>

        {videos.loading ? (
          <VideoGridSkeleton count={4} />
        ) : videos.error ? (
          <ErrorState error={videos.error} onRetry={videos.reload} />
        ) : myVideos.length === 0 ? (
          <EmptyState
            icon="film"
            title="No videos yet"
            message="Your uploads will appear here once you publish your first video."
            action={{ label: "Upload a video", to: "/upload" }}
          />
        ) : (
          <VideoGrid videos={myVideos} />
        )}
      </section>

      {likedVideos.length > 0 && (
        <section>
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Recently liked</h2>
            <Link to="/library" className="text-sm font-medium text-brand">
              See all
            </Link>
          </header>
          {/* A swipeable rail on phones, a plain grid once there is room. */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {likedVideos.map((video) => (
              <div key={video._id} className="w-64 shrink-0 snap-start sm:w-auto">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
