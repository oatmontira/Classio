"use client";

import { useRef, useState } from "react";
import { FileImage, FileText, Link as LinkIcon, UploadCloud, Video, X } from "lucide-react";
import { Button, Field, inputClass } from "@/components/ui";
import type { Assignment } from "@/lib/types";
import type { createSubmissionAction } from "@/lib/actions";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type SubmissionTypeValue = "pdf" | "image" | "link" | "video";

const submissionTypes: Array<{ value: SubmissionTypeValue; label: string; icon: typeof FileText; accept: string }> = [
  { value: "pdf", label: "PDF", icon: FileText, accept: "application/pdf" },
  { value: "image", label: "Image", icon: FileImage, accept: "image/jpeg,image/png,image/webp" },
  { value: "link", label: "Link", icon: LinkIcon, accept: "" },
  { value: "video", label: "Video", icon: Video, accept: "video/mp4,video/webm" }
];

function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}

export function SubmissionForm({
  assignments,
  action,
  locale
}: {
  assignments: Assignment[];
  action: typeof createSubmissionAction;
  locale: Locale;
}) {
  const [selectedType, setSelectedType] = useState<SubmissionTypeValue>("pdf");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedConfig = submissionTypes.find((type) => type.value === selectedType) ?? submissionTypes[0];
  const acceptsFiles = selectedType !== "link";

  const setSelectedFiles = (nextFiles: File[]) => {
    setFiles(nextFiles);
    syncInputFiles(fileInputRef.current, nextFiles);
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setSelectedFiles([...files, ...Array.from(fileList)]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <form action={action} className="grid gap-5">
      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{t(locale, "lateRule")}</div>
      <Field label={t(locale, "assignment")}>
        <select name="assignment_id" className={inputClass} defaultValue={assignments[0]?.id} required>
          {assignments.map((item) => <option key={item.id} value={item.id}>{item.course} / {item.title}</option>)}
        </select>
      </Field>
      <div>
        <p className="text-sm font-semibold">{t(locale, "submissionType")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {submissionTypes.map(({ value, label, icon: Icon }) => {
            const active = selectedType === value;
            return (
              <label key={value} className={`cursor-pointer rounded border p-3 text-center text-sm font-semibold transition ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-[#e2e8f0] bg-white text-slate-600 hover:border-blue-200"}`}>
                <input
                  className="sr-only"
                  name="submission_type"
                  value={value}
                  type="radio"
                  checked={active}
                  onChange={() => {
                    setSelectedType(value);
                    if (value === "link") setSelectedFiles([]);
                  }}
                />
                <Icon className="mx-auto mb-2" size={22} />
                {label}
              </label>
            );
          })}
        </div>
      </div>
      <div
        className={`grid place-items-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"} ${acceptsFiles ? "cursor-pointer" : "opacity-60"}`}
        onClick={() => acceptsFiles && fileInputRef.current?.click()}
        onDragOver={(event) => {
          if (!acceptsFiles) return;
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          if (!acceptsFiles) return;
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <UploadCloud className="text-blue-600" size={36} />
        <p className="mt-3 font-semibold">{acceptsFiles ? t(locale, "dragFiles") : t(locale, "linkNoFile")}</p>
        <p className="mt-1 text-sm text-slate-500">{acceptsFiles ? `${selectedConfig.label} files up to 25 MB each` : t(locale, "pasteUrl")}</p>
        <input
          ref={fileInputRef}
          name="files"
          type="file"
          multiple
          accept={selectedConfig.accept}
          className="sr-only"
          disabled={!acceptsFiles}
          onChange={(event) => addFiles(event.target.files)}
        />
        {acceptsFiles ? <Button type="button" className="mt-4" variant="secondary">{t(locale, "chooseFiles")}</Button> : null}
      </div>
      {files.length ? (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded border border-[#e2e8f0] p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <Field label={selectedType === "link" || selectedType === "video" ? t(locale, "linkUrl") : t(locale, "optionalLinkUrl")}>
        <input name="link_url" className={inputClass} placeholder="https://drive.google.com/..." type="url" required={selectedType === "link"} />
      </Field>
      <Field label={t(locale, "noteToTeacher")}><textarea name="text_note" className="focus-ring min-h-28 rounded border border-[#e2e8f0] p-3 text-sm" placeholder={t(locale, "notePlaceholder")} /></Field>
      <div className="flex justify-end gap-2"><Button type="reset" variant="secondary" onClick={() => setSelectedFiles([])}>{t(locale, "clear")}</Button><Button>{t(locale, "submitWork")}</Button></div>
    </form>
  );
}
