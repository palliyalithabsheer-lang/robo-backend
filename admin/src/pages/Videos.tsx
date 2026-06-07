import { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { storageService } from '../services/storageService';
import type { VideoLesson } from '../types';
import Modal from '../components/ui/Modal';
import ContentStatusBadge from '../components/ui/ContentStatusBadge';
import PublishActions from '../components/ui/PublishActions';
import './Videos.css';

const Videos = () => {
  const { grades, subjects, topics, videos, addVideo, updateVideo, deleteVideo, updateVideoStatus } = useAdmin();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [currentVideo, setCurrentVideo] = useState<VideoLesson | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  
  // Cascading Select State
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  // File Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDuration('');
    setGradeId('');
    setSubjectId('');
    setTopicId('');
    setVideoFile(null);
    setThumbFile(null);
    setCurrentVideo(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (video: VideoLesson) => {
    setCurrentVideo(video);
    setTitle(video.title);
    setDescription(video.description);
    setDuration(video.duration);
    setGradeId(video.gradeId);
    setSubjectId(video.subjectId);
    setTopicId(video.topicId);
    setVideoFile(null);
    setThumbFile(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (video: VideoLesson) => {
    setCurrentVideo(video);
    setIsDeleteOpen(true);
  };

  const handleOpenPreview = (video: VideoLesson) => {
    setCurrentVideo(video);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async () => {
    if (!title || !topicId || !gradeId || !subjectId) return;

    setIsUploading(true);

    try {
      // Simulate file uploads to cloud
      let finalVideoUrl = currentVideo?.videoUrl || '';
      let finalThumbUrl = currentVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80';

      if (videoFile) {
        finalVideoUrl = await storageService.uploadFile(videoFile);
      }
      
      if (thumbFile) {
        finalThumbUrl = await storageService.uploadFile(thumbFile);
      }

      const videoData = {
        gradeId,
        subjectId,
        topicId,
        title,
        description,
        duration: duration || '00:00',
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbUrl,
        status: currentVideo?.status ?? ('draft' as const),
      };

      if (currentVideo) {
        updateVideo(currentVideo.id, videoData);
      } else {
        addVideo(videoData);
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (currentVideo) {
      deleteVideo(currentVideo.id);
      setIsDeleteOpen(false);
    }
  };

  // Filter lists based on selections
  const filteredSubjects = subjects.filter(s => s.gradeId === gradeId);
  const filteredTopics = topics.filter(t => t.subjectId === subjectId);

  return (
    <div className="videos-page">
      <div className="videos-header">
        <div className="videos-title">
          <h1>Video Library</h1>
          <p>Manage lesson videos and assignments</p>
        </div>
        <div className="videos-actions">
          <button onClick={handleOpenAdd}>➕ Upload Video</button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-thumb-container" onClick={() => handleOpenPreview(video)}>
              <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
              <div className="video-duration">{video.duration}</div>
              <div className="video-play-overlay">
                <div className="play-icon">▶</div>
              </div>
            </div>
            
            <div className="video-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="video-topic">{video.topicTitle}</span>
                <ContentStatusBadge status={video.status} />
              </div>
              <h3 className="video-lesson-title">{video.title}</h3>
              <p className="video-desc">{video.description}</p>
              
              <div className="video-actions" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <PublishActions
                  status={video.status}
                  onPublish={() => updateVideoStatus(video.id, 'published')}
                  onUnpublish={() => updateVideoStatus(video.id, 'draft')}
                  onArchive={() => updateVideoStatus(video.id, 'archived')}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon btn-edit" onClick={() => handleOpenEdit(video)} title="Edit">✏️</button>
                  <button className="btn-icon btn-delete" onClick={() => handleOpenDelete(video)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={currentVideo ? "Edit Video Lesson" : "Upload Video Lesson"}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        submitLabel={isUploading ? "Uploading..." : "Save"}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Left Column: Metadata */}
          <div>
            <div className="modal-form-group">
              <label>Lesson Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Intro to Fractions" />
            </div>

            <div className="modal-form-group">
              <label>Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Lesson summary..." />
            </div>

            <div className="modal-form-group">
              <label>Duration (MM:SS)</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="05:30" />
            </div>

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

          {/* Right Column: Files */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="modal-form-group">
              <label>Video File</label>
              <div className="file-upload-wrapper" onClick={() => fileInputRef.current?.click()}>
                <input type="file" accept="video/mp4,video/x-m4v,video/*" ref={fileInputRef} onChange={e => setVideoFile(e.target.files?.[0] || null)} />
                <div className="file-upload-label">
                  <span className="upload-icon">🎬</span>
                  <span>{videoFile ? videoFile.name : currentVideo?.videoUrl ? 'Replace Video' : 'Select Video File'}</span>
                </div>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Thumbnail Image</label>
              <div className="file-upload-wrapper" onClick={() => thumbInputRef.current?.click()}>
                <input type="file" accept="image/png, image/jpeg" ref={thumbInputRef} onChange={e => setThumbFile(e.target.files?.[0] || null)} />
                <div className="file-upload-label">
                  <span className="upload-icon">🖼️</span>
                  <span>{thumbFile ? thumbFile.name : currentVideo?.thumbnailUrl ? 'Replace Thumbnail' : 'Select Image File'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        title="Delete Video"
        onClose={() => setIsDeleteOpen(false)}
        onSubmit={handleDelete}
        submitLabel="Delete"
        isDanger={true}
      >
        <p>Are you sure you want to delete <strong>{currentVideo?.title}</strong>?</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
          This will permanently remove the video from the library.
        </p>
      </Modal>

      {/* Preview Modal */}
      {isPreviewOpen && currentVideo && (
        <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)} style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: '800px', background: 'transparent', boxShadow: 'none' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
              <button className="btn-close" style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }} onClick={() => setIsPreviewOpen(false)}>×</button>
            </div>
            <video 
              src={currentVideo.videoUrl} 
              poster={currentVideo.thumbnailUrl} 
              className="preview-video-player"
              controls 
              autoPlay 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
