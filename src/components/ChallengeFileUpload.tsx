import { useState, useRef } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChallengeFileUploadProps {
  challengeId: string;
  existingFiles: string[];
  onFilesUpdated: (files: string[]) => void;
}

const ChallengeFileUpload = ({ challengeId, existingFiles, onFilesUpdated }: ChallengeFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<string[]>(existingFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(e.target.files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${challengeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("challenge-files")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("challenge-files")
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    const newFiles = [...files, ...uploadedUrls];
    setFiles(newFiles);
    onFilesUpdated(newFiles);

    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} file(s) uploaded`);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = async (fileUrl: string) => {
    // Extract file path from URL
    const urlParts = fileUrl.split("/challenge-files/");
    if (urlParts.length > 1) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from("challenge-files").remove([filePath]);
    }

    const newFiles = files.filter((f) => f !== fileUrl);
    setFiles(newFiles);
    onFilesUpdated(newFiles);
    toast.success("File removed");
  };

  const getFileName = (url: string) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix if present
    const match = fileName.match(/^\d+-(.+)$/);
    return match ? match[1] : fileName;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <span className="text-xs text-muted-foreground font-mono">
          Binaries, source code, challenge files
        </span>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-primary" />
                <span className="text-sm font-mono truncate max-w-[200px]">
                  {getFileName(file)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeFileUpload;
