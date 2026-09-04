import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { TextArea, TextInput, Toggle } from "../components/ui/Field.jsx";
import { FilePicker } from "../components/ui/FilePicker.jsx";
import { publishVideo } from "../api/videos.js";
import { useToast } from "../context/ToastContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function Upload() {
  useDocumentTitle("Upload");

  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ title: "", description: "", isPublished: true });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Give the video a title.";
    if (!form.description.trim()) next.description = "A description is required.";
    if (!videoFile) next.videoFile = "Choose a video file to upload.";
    if (!thumbnail) next.thumbnail = "Choose a thumbnail image.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const created = await publishVideo({ ...form, videoFile, thumbnail });
      toast.success("Video published");
      navigate(created?._id ? `/watch/${created._id}` : "/studio", {
        replace: true,
        state: created ? { video: created } : undefined,
      });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-ink">Upload a video</h1>
      <p className="mt-1 text-sm text-muted">
        Large files take a while — keep this tab open until it finishes.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
        <FilePicker
          label="Video file"
          required
          accept="video/*"
          hint="MP4, MOV or WebM"
          file={videoFile}
          onSelect={setVideoFile}
          error={errors.videoFile}
        />

        <FilePicker
          label="Thumbnail"
          required
          accept="image/*"
          hint="16:9 images look best"
          file={thumbnail}
          onSelect={setThumbnail}
          error={errors.thumbnail}
        />

        <TextInput
          label="Title"
          required
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          error={errors.title}
          maxLength={120}
        />

        <TextArea
          label="Description"
          required
          rows={5}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          error={errors.description}
        />

        <Toggle
          label="Publish immediately"
          description="Turn this off to keep the video as a draft."
          checked={form.isPublished}
          onChange={(isPublished) => setForm((prev) => ({ ...prev, isPublished }))}
        />

        {errors.form && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {errors.form}
          </p>
        )}

        {/* Sticks to the bottom of the viewport on phones so the primary
            action stays reachable while scrolling a long form. */}
        <div className="sticky bottom-20 z-10 -mx-4 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <Button type="submit" size="lg" fullWidth loading={submitting} className="md:w-auto">
            {submitting ? "Uploading…" : "Publish video"}
          </Button>
        </div>
      </form>
    </div>
  );
}
