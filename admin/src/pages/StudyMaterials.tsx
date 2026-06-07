import { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { storageService } from '../services/storageService';
import type { StudyMaterial } from '../types';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ContentStatusBadge from '../components/ui/ContentStatusBadge';
import PublishActions from '../components/ui/PublishActions';
import './StudyMaterials.css';

const FILE_TYPE_ICONS: Record<string, string> = {
  PDF: '📄',
  IMAGE: '🖼️',
  NOTES: '📝',
  WORKSHEET: '✏️'
};

const StudyMaterials = () => {
  const { grades, subjects, topics, studyMaterials, addStudyMaterial, updateStudyMaterial, deleteStudyMaterial, updateStudyMaterialStatus } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial | null>(null);

  // Form State
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'IMAGE' | 'NOTES' | 'WORKSHEET'>('PDF');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCurrentMaterial(null);
    setGradeId('');
    setSubjectId('');
    setTopicId('');
    setTitle('');
    setDescription('');
    setFileType('PDF');
    setFile(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setGradeId(material.gradeId || '');
    setSubjectId(material.subjectId || '');
    setTopicId(material.topicId);
    setTitle(material.title);
    setDescription(material.description);
    setFileType(material.fileType);
    setFile(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setIsDeleteOpen(true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    // Auto-detect file type roughly
    const type = selectedFile.type;
    if (type.includes('pdf')) setFileType('PDF');
    else if (type.includes('image')) setFileType('IMAGE');
    else if (type.includes('word') || type.includes('document')) setFileType('WORKSHEET');
    else setFileType('NOTES');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !topicId) return;

    setIsUploading(true);

    try {
      let finalFileUrl = currentMaterial?.fileUrl || '';

      if (file) {
        finalFileUrl = await storageService.uploadFile(file);
      }

      const data = {
        gradeId,
        subjectId,
        topicId,
        title,
        description,
        fileType,
        fileUrl: finalFileUrl,
        status: currentMaterial?.status ?? ('draft' as const)
      };

      if (currentMaterial) {
        updateStudyMaterial(currentMaterial.id, data);
      } else {
        addStudyMaterial(data);
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (currentMaterial) {
      deleteStudyMaterial(currentMaterial.id);
      setIsDeleteOpen(false);
    }
  };

  const handleView = (material: StudyMaterial) => {
    window.open(material.fileUrl, '_blank');
  };

  const filteredSubjects = subjects.filter(s => s.gradeId === gradeId);
  const filteredTopics = topics.filter(t => t.subjectId === subjectId);

  const columns = [
    { 
      key: 'fileType', 
      title: 'Type',
      render: (m: StudyMaterial) => (
        <span className={`file-type-badge file-type-${m.fileType.toLowerCase()}`}>
          {FILE_TYPE_ICONS[m.fileType]} {m.fileType}
        </span>
      )
    },
    { key: 'title', title: 'Title' },
    { key: 'topicTitle', title: 'Topic' },
    {
      key: 'status',
      title: 'Status',
      render: (m: StudyMaterial) => <ContentStatusBadge status={m.status} />
    },
    {
      key: 'publish',
      title: 'Publishing',
      render: (m: StudyMaterial) => (
        <PublishActions
          status={m.status}
          onPublish={() => updateStudyMaterialStatus(m.id, 'published')}
          onUnpublish={() => updateStudyMaterialStatus(m.id, 'draft')}
          onArchive={() => updateStudyMaterialStatus(m.id, 'archived')}
        />
      )
    },
    { key: 'createdAt', title: 'Uploaded At' },
    {
      key: 'view_action',
      title: '',
      render: (m: StudyMaterial) => (
        <button 
          onClick={() => handleView(m)} 
          style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="study-materials-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Study Materials</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Upload PDFs, Images, and Worksheets</p>
      </div>

      <Table
        title="Material Library"
        data={studyMaterials}
        columns={columns}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        addButtonLabel="Upload Material"
      />

      <Modal
        isOpen={isFormOpen}
        title={currentMaterial ? "Edit Material" : "Upload Material"}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={isUploading ? "Uploading..." : "Save"}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Left Column: Form */}
          <div>
            <div className="modal-form-group">
              <label>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 4 Notes" />
            </div>

            <div className="modal-form-group">
              <label>Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary..." />
            </div>

            <div className="modal-form-group">
              <label>Material Type</label>
              <select value={fileType} onChange={e => setFileType(e.target.value as any)}>
                <option value="PDF">PDF Document</option>
                <option value="IMAGE">Image</option>
                <option value="NOTES">Text / Notes</option>
                <option value="WORKSHEET">Worksheet</option>
              </select>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />

            <div className="modal-form-group">
              <label>Grade</label>
              <select value={gradeId} onChange={e => { setGradeId(e.target.value); setSubjectId(''); setTopicId(''); }}>
                <option value="" disabled>Select Grade</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Subject</label>
              <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setTopicId(''); }} disabled={!gradeId}>
                <option value="" disabled>Select Subject</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Topic</label>
              <select value={topicId} onChange={e => setTopicId(e.target.value)} disabled={!subjectId}>
                <option value="" disabled>Select Topic</option>
                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          {/* Right Column: Drag and Drop */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>File Upload</label>
            
            {file ? (
              <div className="file-preview">
                <div className="file-preview-icon">{FILE_TYPE_ICONS[fileType]}</div>
                <div className="file-preview-info">
                  <div className="file-preview-name">{file.name}</div>
                  <div className="file-preview-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button className="btn-remove-file" onClick={() => setFile(null)}>×</button>
              </div>
            ) : currentMaterial?.fileUrl && !file ? (
              <div className="file-preview">
                <div className="file-preview-icon">{FILE_TYPE_ICONS[currentMaterial.fileType]}</div>
                <div className="file-preview-info">
                  <div className="file-preview-name">Current File Attached</div>
                  <div className="file-preview-size"><a href={currentMaterial.fileUrl} target="_blank" rel="noreferrer">View File</a></div>
                </div>
                <button className="btn-remove-file" onClick={() => fileInputRef.current?.click()} title="Replace File">↻</button>
              </div>
            ) : null}

            {(!file && !currentMaterial?.fileUrl) && (
              <div 
                className={`drag-drop-zone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="drag-drop-input"
                  onChange={handleFileChange}
                  accept=".pdf,image/*,.doc,.docx,.txt"
                />
                <div className="drag-drop-icon">☁️</div>
                <div className="drag-drop-text">Drag & drop a file here</div>
                <div className="drag-drop-subtext">or click to browse</div>
              </div>
            )}
          </div>

        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        title="Delete Material"
        onClose={() => setIsDeleteOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete <strong>{currentMaterial?.title}</strong>?</p>
        <p style={{ color: 'var(--color-red)', fontSize: '0.85rem', marginTop: '10px' }}>
          This will permanently remove the file from the library.
        </p>
      </Modal>
    </div>
  );
};

export default StudyMaterials;
