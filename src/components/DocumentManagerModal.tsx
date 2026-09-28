import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Download, 
  Check, 
  X, 
  Tag, 
  Building, 
  Star,
  FileCheck,
  Plus
} from 'lucide-react';
import { AppDocument, JobApplication } from '../types';

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AppDocument[];
  applications: JobApplication[];
  onAddDocument: (doc: AppDocument) => void;
  onDeleteDocument: (id: string) => void;
  onToggleDefault: (id: string) => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  applications,
  onAddDocument,
  onDeleteDocument,
  onToggleDefault
}) => {
  const [selectedDoc, setSelectedDoc] = useState<AppDocument | null>(documents[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // New doc form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AppDocument['type']>('Resume');
  const [newContent, setNewContent] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredDocs = filterType === 'all' 
    ? documents 
    : documents.filter(d => d.type.toLowerCase().includes(filterType.toLowerCase()));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || 'Document content imported successfully.';
      const newDoc: AppDocument = {
        id: `doc-${Date.now()}`,
        title: file.name,
        type: file.name.toLowerCase().includes('cover') ? 'Cover Letter' : file.name.toLowerCase().includes('offer') ? 'Offer Letter' : 'Resume',
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        uploadDate: new Date().toISOString().split('T')[0],
        applicationIds: applications.slice(0, 1).map(a => a.id),
        contentPreview: content,
        isDefault: documents.length === 0
      };
      onAddDocument(newDoc);
      setSelectedDoc(newDoc);
    };
    reader.readAsText(file);
  };

  const handleCreateDocument = () => {
    if (!newTitle.trim()) return;

    const newDoc: AppDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.endsWith('.pdf') ? newTitle : `${newTitle}.pdf`,
      type: newType,
      fileName: `${newTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: '120 KB',
      uploadDate: new Date().toISOString().split('T')[0],
      applicationIds: selectedAppIds,
      contentPreview: newContent || `Sample document content for ${newTitle}.`,
      isDefault: false
    };

    onAddDocument(newDoc);
    setSelectedDoc(newDoc);
    setIsUploading(false);
    setNewTitle('');
    setNewContent('');
  };

  const downloadDocument = (doc: AppDocument) => {
    const blob = new Blob([doc.contentPreview], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', doc.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base">Candidate Document Management System (DMS)</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  {documents.length} Files Stored
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Organize tailored resumes, cover letters, technical assessments & offer letters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Sidebar + Document Reader */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Document List */}
          <div className="md:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
            
            {/* Filter and Upload Header */}
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
                  {['all', 'resume', 'cover', 'offer'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterType(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider transition-all ${
                        filterType === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsUploading(!isUploading)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add File</span>
                </button>
              </div>

              {/* Native file upload input */}
              <label className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 text-xs cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload Document (.pdf, .txt, .doc)</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Document Cards */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredDocs.map(doc => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsUploading(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs truncate max-w-[210px] text-white">
                        {doc.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.isDefault && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Default
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {doc.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{doc.fileSize} • Uploaded {doc.uploadDate}</span>
                      <span>{doc.applicationIds.length} job(s) linked</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Document Viewer / Add Form */}
          <div className="md:col-span-7 flex flex-col bg-slate-900 overflow-hidden">
            {isUploading ? (
              <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-400" />
                    Create / Add Tailored Document
                  </h3>
                  <button
                    onClick={() => setIsUploading(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Document Title:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Tejas_Mali_Resume_TelcoVibe_VoIP.pdf"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Document Category:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Resume">Resume</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Portfolio">Portfolio Sample</option>
                    <option value="Technical Assessment">Technical Assessment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Content / Text Extracted:</label>
                  <textarea
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Paste or edit the resume / letter contents..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono leading-relaxed focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleCreateDocument}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save Document to Library
                </button>
              </div>
            ) : selectedDoc ? (
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* Document Action Bar */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{selectedDoc.title}</span>
                    <span className="text-[11px] text-slate-400">
                      {selectedDoc.type} • {selectedDoc.fileSize}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleDefault(selectedDoc.id)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                        selectedDoc.isDefault
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="Set as default primary resume"
                    >
                      <Star className={`w-3 h-3 ${selectedDoc.isDefault ? 'fill-current' : ''}`} />
                      <span>{selectedDoc.isDefault ? 'Primary Resume' : 'Make Default'}</span>
                    </button>

                    <button
                      onClick={() => downloadDocument(selectedDoc)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                      title="Download document text"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete ${selectedDoc.title}?`)) {
                          onDeleteDocument(selectedDoc.id);
                          setSelectedDoc(documents.find(d => d.id !== selectedDoc.id) || null);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Linked Applications Badge Bar */}
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Linked Applications:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.applicationIds.length === 0 ? (
                      <span className="italic text-slate-500">Not assigned to specific jobs yet</span>
                    ) : (
                      selectedDoc.applicationIds.map(appId => {
                        const app = applications.find(a => a.id === appId);
                        return (
                          <span
                            key={appId}
                            className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-900 text-indigo-300"
                          >
                            {app?.company || appId}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Document Content Preview / Reader */}
                <div className="p-4 overflow-y-auto flex-1 bg-slate-950/40">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-inner text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.contentPreview}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a document on the left or upload a new resume.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
