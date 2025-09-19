"use client";

import * as React from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { FileUpload } from "@/components/ui/file-upload";
import { LoaderFive } from "@/components/ui/loader";

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

            const res = await fetch("https://clarifai-jm7e.onrender.com/upload/pdf", {
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
    <div className="flex justify-center md:justify-start items-center p-2 md:p-8 w-full h-[80px] sm:h-auto lg:h-auto rounded-2xl">
      <div
        onClick={!isUploading ? handleFileUploadButtonClick : undefined}
        className={`group cursor-pointer border rounded-xl 
          w-[90%] sm:w-[90%] md:w-[320px] 
          max-w-md
          text-center 
          ${
            isUploading
              ? "opacity-70 pointer-events-none"
              : "bg-black"
          }
        `}
      >
        <div className="flex flex-col items-center gap-1 sm:gap-3 shadow-[2px_1px_20px_rgba(8,_112,_184,_0.7)] rounded-2xl">
          {isUploading ? (
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <LoaderFive text=" Uploading PDF..." />
            </div>
          ) : uploadSuccess ? (
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-500" />
              <p className="text-xs sm:text-sm text-green-500">
                Upload successful!
              </p>
            </div>
          ) : uploadError ? (
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <XCircle className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500" />
              <p className="text-xs sm:text-sm text-red-500">{uploadError}</p>
            </div>
          ) : (
            <>
              <div className="p-1 sm:p-4 rounded-full transition">
                <FileUpload />
              </div>
              <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-white">
                Upload PDF File
              </h3>
              <p className="text-[10px] sm:text-sm text-slate-400">
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
