import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Plus,
  FileText,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "../components/shared/NavigationHeader";
import ResumeCard from "../components/resume/ResumeCard";
import ResumePreview from "../components/resume/ResumePreview";
import { downloadAsHTML, downloadAsPDF } from "../utils/resumeDownload";
import { Notification } from "../components/shared/Notification";

interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
}

interface WorkExperience {
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

interface Education {
  institutionName: string;
  degreeOrProgram: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

interface Resume {
  id: string;
  title: string;
  resume_name: string;
  template_name: string;
  personal_info: PersonalInfo;
  work_experience: WorkExperience[];
  skills: string[];
  education: Education[];
  status: string;
  file_size: string;
  share_token: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function ResumePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<Resume | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResumes(data);
    } else if (error) {
      setNotification({ message: "Failed to load resumes", type: "error" });
    }
    setLoading(false);
  };

  const generateResume = async () => {
    if (!user) return;
    setGenerating(true);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: workExperiences } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    const { data: skills } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id);

    const { data: certifications } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", user.id);

    const { data: education } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", user.id);

    const { data: languages } = await supabase
      .from("languages")
      .select("*")
      .eq("user_id", user.id);

    const resumeData = {
      profile,
      workExperiences: workExperiences || [],
      skills: skills || [],
      certifications: certifications || [],
      education: education || [],
      languages: languages || [],
    };

    const resumeName = `Resume - ${new Date().toLocaleDateString()}`;

    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        resume_name: resumeName,
        template_name: "professional",
        resume_data: resumeData,
      })
      .select()
      .single();

    if (!error && newResume) {
      setResumes([newResume, ...resumes]);
      setSelectedResume(newResume.id);
    }

    setGenerating(false);
  };

  const viewResume = (resume: Resume) => {
    setSelectedResume(resume);
  };

  const deleteResume = async (resumeId: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", resumeId);
    if (!error) {
      setResumes(resumes.filter((r) => r.id !== resumeId));
      setNotification({ message: "Resume deleted successfully", type: "success" });
    } else {
      setNotification({ message: "Failed to delete resume", type: "error" });
    }
  };

  const shareResume = async (resume: Resume) => {
    const { error } = await supabase
      .from("resumes")
      .update({ is_public: true })
      .eq("id", resume.id);

    if (!error) {
      const shareUrl = `${window.location.origin}/shared-resume/${resume.share_token}`;
      await navigator.clipboard.writeText(shareUrl);
      setNotification({ message: "Share link copied to clipboard!", type: "success" });
      loadResumes();
    } else {
      setNotification({ message: "Failed to generate share link", type: "error" });
    }
  };

  const downloadResume = async (resume: Resume, format: "html" | "pdf") => {
    try {
      if (format === "html") {
        downloadAsHTML(resume);
        setNotification({ message: "Resume downloaded as HTML", type: "success" });
      } else {
        await downloadAsPDF(resume);
        setNotification({ message: "Resume downloaded as PDF", type: "success" });
      }
    } catch (error) {
      setNotification({ message: "Failed to download resume", type: "error" });
    }
    setShowDownloadModal(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80]">
      <NavigationHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  My Resumes
                </h2>
                <p className="text-[#A8B8CC]">
                  Generate and manage your professional resumes with multiple
                  download formats.
                </p>
              </div>
              <button
                onClick={generateResume}
                disabled={generating}
                className="flex items-center gap-2 bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <Plus size={18} />
                <span>
                  {generating ? "Generating..." : "Generate New Resume"}
                </span>
              </button>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div className="bg-[#003A6E] bg-opacity-50 backdrop-blur-lg border border-[#6A7B93] border-opacity-20 rounded-2xl p-12 text-center">
              <FileText className="mx-auto text-[#FBC888] mb-4" size={64} />
              <p className="text-[#A8B8CC] text-lg mb-4">
                You haven't created any resumes yet.
              </p>
              <p className="text-[#6A7B93] mb-6">
                Start by generating your first professional resume or chat with
                our AI Assistant for help.
              </p>
              <button
                onClick={() => navigate("/chatbot")}
                className="bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-6 py-3 rounded-lg transition-all duration-200"
              >
                Create First Resume with AI Assistant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  id={resume.id}
                  title={resume.title || resume.resume_name}
                  createdAt={resume.created_at}
                  fileSize={resume.file_size}
                  status={resume.status}
                  onView={() => viewResume(resume)}
                  onDownload={() => setShowDownloadModal(resume)}
                  onShare={() => shareResume(resume)}
                  onDelete={() => deleteResume(resume.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#003A6E] border border-[#6A7B93] border-opacity-20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">
              Download Resume
            </h3>
            <p className="text-[#A8B8CC] mb-6">Choose your preferred format:</p>
            <div className="space-y-3">
              <button
                onClick={() => downloadResume(showDownloadModal, "html")}
                className="w-full flex items-center justify-between bg-[#1E4C80] hover:bg-[#2A4F7A] text-white px-6 py-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div className="text-left">
                    <div className="font-semibold">HTML Format</div>
                    <div className="text-xs text-[#A8B8CC]">
                      Web-friendly format
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => downloadResume(showDownloadModal, "pdf")}
                className="w-full flex items-center justify-between bg-[#FBC888] hover:bg-[#FBC888]/90 text-[#002B5C] px-6 py-4 rounded-lg transition-all duration-200 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div className="text-left">
                    <div className="font-semibold">PDF Format</div>
                    <div className="text-xs opacity-70">Print-ready format</div>
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowDownloadModal(null)}
              className="w-full mt-4 text-[#6A7B93] hover:text-white transition-colors py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedResume && (
        <ResumePreview
          resume={selectedResume}
          onClose={() => setSelectedResume(null)}
          isModal={true}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
