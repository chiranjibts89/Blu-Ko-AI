import { FileText, Eye, Download, Share2, Trash2 } from 'lucide-react';

interface ResumeCardProps {
  id: string;
  title: string;
  createdAt: string;
  fileSize: string;
  status: string;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export default function ResumeCard({
  title,
  createdAt,
  fileSize,
  status,
  onView,
  onDownload,
  onShare,
  onDelete,
}: ResumeCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Created {formatDate(createdAt)}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'complete'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {status === 'complete' ? 'Complete' : 'Draft'}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Size: {fileSize}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onView}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
