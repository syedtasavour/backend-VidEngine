import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoGridSkeleton } from "../components/ui/Skeleton.jsx";
import { VideoGrid } from "../components/VideoCard.jsx";
import { getLikedVideos } from "../api/social.js";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function Library() {
  useDocumentTitle("Liked videos");

  const liked = useAsync(() => getLikedVideos({ limit: 24 }), []);
  const videos = (liked.data?.docs ?? []).map((entry) => entry.likedVideos).filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Liked videos</h1>
        <p className="mt-1 text-sm text-muted">Everything you have given a like.</p>
      </div>

      {liked.loading ? (
        <VideoGridSkeleton />
      ) : liked.error ? (
        <ErrorState error={liked.error} onRetry={liked.reload} />
      ) : videos.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Nothing liked yet"
          message="Videos you like will collect here."
          action={{ label: "Browse your videos", to: "/" }}
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
