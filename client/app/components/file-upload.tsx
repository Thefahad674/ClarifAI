"use client";

import * as React from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";

const FileUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleFileUploadButtonClick = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");

    el.addEventListener("change", async () => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append("pdf", file);

          try {
            setIsUploading(true);
            setUploadSuccess(false);
            setUploadError(null);

            const res = await fetch("http://localhost:8000/upload/pdf", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error(`Upload failed: ${res.status}`);
            }

            console.log("File uploaded successfully ✅");
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
          } catch (err: unknown) {
            console.error("Upload error ❌", err);
            if (err instanceof Error) {
              setUploadError(err.message);
            } else {
              setUploadError("Upload failed");
            }
            setTimeout(() => setUploadError(null), 3000);
          } finally {
            setIsUploading(false);
          }
        }
      }
    });

    el.click();
  };

  return (
    <div className="flex justify-center md:justify-start items-center p-4 md:p-8 w-full rounded-2xl">
      <div
        onClick={!isUploading ? handleFileUploadButtonClick : undefined}
        className={`group cursor-pointer border border-dashed border-slate-300 bg-slate-900 rounded-xl 
          p-6 sm:p-8 md:p-10 
          w-full sm:w-[90%] md:w-[320px] 
          max-w-md
          text-center transition-all duration-300 
          ${
            isUploading
              ? "opacity-70 pointer-events-none"
              : "hover:bg-slate-800"
          }
        `}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-500 animate-spin" />
              <p className="text-xs sm:text-sm text-slate-200">
                Uploading PDF...
              </p>
            </div>
          ) : uploadSuccess ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-500" />
              <p className="text-xs sm:text-sm text-green-500">
                Upload successful!
              </p>
            </div>
          ) : uploadError ? (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500" />
              <p className="text-xs sm:text-sm text-red-500">{uploadError}</p>
            </div>
          ) : (
            <>
              <div className="p-3 sm:p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition">
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white group-hover:text-slate-100" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                Upload PDF File
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Click to select a PDF file from your computer
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
