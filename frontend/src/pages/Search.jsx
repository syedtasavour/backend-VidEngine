import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { getChannelProfile } from "../api/auth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { formatCount } from "../utils/format.js";

const RECENT_KEY = "videngine.recentChannels";

function readRecent() {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function rememberChannel(username) {
  try {
    const next = [username, ...readRecent().filter((name) => name !== username)].slice(0, 6);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return readRecent();
  }
}

/**
 * The API has no full-text search, only channel lookup by exact username, so
 * this page is an honest username lookup rather than a fake search field.
 */
export default function Search() {
  useDocumentTitle("Search");

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get("u") ?? "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(readRecent);

  async function lookup(username) {
    const cleaned = username.trim().toLowerCase().replace(/^@/, "");
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setParams({ u: cleaned }, { replace: true });

    try {
      const channel = await getChannelProfile(cleaned);
      setResult(channel);
      setRecent(rememberChannel(cleaned));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Find a channel</h1>
        <p className="mt-1 text-sm text-muted">Look somebody up by their exact username.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          lookup(term);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="username"
            aria-label="Channel username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="search"
            className="w-full rounded-xl border border-line bg-surface py-3 pl-9 pr-3 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none"
          />
        </div>
        <Button type="submit" loading={loading} className="shrink-0">
          Search
        </Button>
      </form>

      {recent.length > 0 && !result && !loading && (
        <div className="flex flex-wrap gap-2">
          {recent.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setTerm(name);
                lookup(name);
              }}
              className="min-h-9 rounded-full border border-line bg-surface px-3.5 text-sm text-muted transition hover:border-brand hover:text-ink"
            >
              @{name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10 text-muted">
          <Spinner className="size-6" />
        </div>
      )}

      {error && !loading && (
        <EmptyState
          icon="alert"
          title="No channel found"
          message={error}
        />
      )}

      {result && !loading && (
        <button
          type="button"
          onClick={() => navigate(`/channel/${result.username}`)}
          className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-brand"
        >
          <Avatar src={result.avatar} name={result.fullName} id={result.username} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">{result.fullName}</span>
            <span className="block truncate text-sm text-muted">@{result.username}</span>
            <span className="mt-1 block text-xs text-muted">
              {formatCount(result.subscribersCount, "subscriber")}
            </span>
          </span>
          <Icon name="chevron" className="size-5 shrink-0 text-muted" />
        </button>
      )}
    </div>
  );
}
