import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { LoadingBlock } from "../components/ui/Spinner.jsx";
import { EmptyState, ErrorState } from "../components/ui/EmptyState.jsx";
import { VideoGridSkeleton } from "../components/ui/Skeleton.jsx";
import { VideoGrid } from "../components/VideoCard.jsx";
import { TweetComposer, TweetList } from "./Tweets.jsx";
import { getChannelProfile } from "../api/auth.js";
import { getChannelVideos, getPublishedVideos } from "../api/videos.js";
import { getUserTweets, toggleSubscription } from "../api/social.js";
import { getUserPlaylists } from "../api/playlists.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

const TABS = [
  { id: "videos", label: "Videos" },
  { id: "playlists", label: "Playlists" },
  { id: "tweets", label: "Tweets" },
];

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState("videos");
  const [subscribing, setSubscribing] = useState(false);

  const channel = useAsync(() => getChannelProfile(username), [username]);
  const profile = channel.data;
  const isOwnChannel = Boolean(user && profile && user.username === profile.username);
  const channelId = isOwnChannel ? user._id : profile?._id;

  useDocumentTitle(profile ? `@${profile.username}` : "Channel");

  // Own channel: every video including drafts. Other channels: published only.
  const videos = useAsync(
    () =>
      !channelId
        ? Promise.resolve(null)
        : isOwnChannel
          ? getChannelVideos(channelId, { limit: 24 })
          : getPublishedVideos(channelId, { limit: 24 }),
    [channelId, isOwnChannel]
  );

  const playlists = useAsync(
    () => (channelId && tab === "playlists" ? getUserPlaylists(channelId) : Promise.resolve(null)),
    [channelId, tab]
  );

  const tweets = useAsync(
    () =>
      channelId && tab === "tweets"
        ? getUserTweets(channelId).catch(() => ({ docs: [] }))
        : Promise.resolve(null),
    [channelId, tab]
  );

  async function onToggleSubscription() {
    setSubscribing(true);
    try {
      await toggleSubscription(channelId);
      await channel.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubscribing(false);
    }
  }

  if (channel.loading) return <LoadingBlock label="Loading channel" />;
  if (channel.error) return <ErrorState error={channel.error} onRetry={channel.reload} />;
  if (!profile) return null;

  const videoDocs = videos.data?.docs ?? [];

  return (
    <div className="space-y-6">
      <header className="-mx-4 sm:-mx-5 lg:mx-0">
        <div className="relative h-28 overflow-hidden bg-brand-soft sm:h-40 lg:rounded-2xl">
          {profile.coverImage && (
            <img src={profile.coverImage} alt="" className="size-full object-cover" />
          )}
        </div>

        {/* `relative` is load-bearing: the banner above is positioned, so a
            static sibling would paint underneath it and hide the avatar. */}
        <div className="relative px-4 sm:px-5 lg:px-0">
          {/* The avatar overlaps the banner, which needs a negative offset. */}
          <div className="-mt-8 flex items-end gap-3 sm:-mt-10">
            <Avatar
              src={profile.avatar}
              name={profile.fullName}
              id={profile.username}
              size="lg"
              className="ring-4 ring-bg sm:size-24"
            />
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">
                {profile.fullName}
              </h1>
              <p className="truncate text-sm text-muted">@{profile.username}</p>
            </div>
          </div>

          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            <span>{formatCount(profile.subscribersCount, "subscriber")}</span>
            <span aria-hidden="true">·</span>
            <span>{formatCount(profile.channelsSubscribedToCount)} subscribed</span>
          </p>

          <div className="mt-4">
            {isOwnChannel ? (
              <div className="flex gap-2">
                <Button to="/studio" variant="secondary" fullWidth className="sm:w-auto">
                  <Icon name="chart" className="size-4" />
                  Studio
                </Button>
                <Button to="/settings" variant="secondary" fullWidth className="sm:w-auto">
                  <Icon name="settings" className="size-4" />
                  Settings
                </Button>
              </div>
            ) : (
              <Button
                fullWidth
                className="sm:w-auto"
                variant={profile.isSubscribed ? "secondary" : "primary"}
                loading={subscribing}
                onClick={onToggleSubscription}
              >
                {profile.isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Channel sections"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 no-scrollbar sm:mx-0 sm:px-0"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-medium transition ${
              tab === item.id
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "videos" &&
        (videos.loading ? (
          <VideoGridSkeleton />
        ) : videos.error ? (
          <ErrorState error={videos.error} onRetry={videos.reload} />
        ) : videoDocs.length === 0 ? (
          <EmptyState
            icon="film"
            title="No videos here yet"
            message={
              isOwnChannel
                ? "Publish your first video to fill this page."
                : "This channel has not published anything."
            }
            action={isOwnChannel ? { label: "Upload a video", to: "/upload" } : undefined}
          />
        ) : (
          <VideoGrid videos={videoDocs} />
        ))}

      {tab === "playlists" &&
        (playlists.loading ? (
          <LoadingBlock label="Loading playlists" />
        ) : (playlists.data?.docs ?? []).length === 0 ? (
          <EmptyState icon="playlist" title="No playlists" message="Nothing here yet." />
        ) : (
          <PlaylistCards playlists={playlists.data.docs} />
        ))}

      {tab === "tweets" && (
        <div className="mx-auto max-w-2xl space-y-4">
          {isOwnChannel && <TweetComposer onPosted={tweets.reload} />}
          {tweets.loading ? (
            <LoadingBlock label="Loading tweets" />
          ) : (
            <TweetList
              tweets={tweets.data?.docs ?? []}
              currentUserId={user?._id}
              onChanged={tweets.reload}
              author={profile}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PlaylistCards({ playlists }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {playlists.map((playlist) => (
        <li key={playlist._id}>
          <Button
            to={`/playlists/${playlist._id}`}
            variant="secondary"
            className="!min-h-0 w-full !justify-start gap-3 !px-4 !py-4 text-left"
          >
            <Icon name="playlist" className="size-5 shrink-0 text-brand" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{playlist.name}</span>
              <span className="block text-xs text-muted">
                {formatCount(playlist.videos?.length ?? 0, "video")}
              </span>
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}
