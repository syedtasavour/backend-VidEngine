import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoGridSkeleton } from "../components/ui/Skeleton.jsx";
import { VideoGrid } from "../components/VideoCard.jsx";
import { getWatchHistory } from "../api/misc.js";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function History() {
  useDocumentTitle("Watch history");

  const history = useAsync(() => getWatchHistory(), []);
  // The endpoint can answer with a bare array or an envelope, so normalise.
  const videos = Array.isArray(history.data)
    ? history.data
    : (history.data?.watchHistory ?? []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Watch history</h1>
        <p className="mt-1 text-sm text-muted">Videos you have opened recently.</p>
      </div>

      {history.loading ? (
        <VideoGridSkeleton count={4} />
      ) : history.error ? (
        <ErrorState error={history.error} onRetry={history.reload} />
      ) : videos.length === 0 ? (
        <EmptyState
          icon="clock"
          title="No history yet"
          message="Watch a few videos and they will show up here."
        />
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
