import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { validateJSONFile } from "@/lib/auth";
import { uploadCookie } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  username: string;
  onUploadSuccess: () => void;
}

const FileUpload = ({ username, onUploadSuccess }: FileUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setLoading(true);

    try {
      const cookieData = await validateJSONFile(file);
      const success = await uploadCookie(cookieData, username, file.name);

      if (success) {
        toast({
          title: "Upload successful!",
          description: `${file.name} has been uploaded and is now active.`,
        });
        onUploadSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload cookie file. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description:
          error instanceof Error
            ? error.message
            : "Please upload a valid JSON file.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Cookie File
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your JSON cookie file here, or click to browse
          </p>
          <div className="space-y-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Uploading..." : "Select JSON File"}
            </Button>
            <p className="text-xs text-gray-400">
              Maximum file size: 1MB • JSON format only
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
