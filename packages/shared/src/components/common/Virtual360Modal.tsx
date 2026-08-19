import React, { useState } from 'react';
import { Modal } from '@tms/shared/components/common/Modal';
import { Button } from '@tms/shared/components/common/Button';
import { Eye, RotateCw, Volume2, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Virtual360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  imageUrl: string;
  tourId?: string;
}

export const Virtual360Modal: React.FC<Virtual360ModalProps> = ({
  isOpen,
  onClose,
  destinationName,
  imageUrl,
  tourId,
}) => {
  const navigate = useNavigate();
  const [panX, setPanX] = useState(50);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Virtual 360° Panorama & Media Experience — ${destinationName}`}
      footer={
        <div className="flex-between" style={{ width: '100%' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={14} style={{ color: 'var(--brand-primary)' }} /> Drag horizontally to rotate 360° view
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Preview
            </Button>

            {tourId && (
              <Button
                variant="primary"
                size="sm"
                icon={<Ticket size={15} />}
                onClick={() => {
                  onClose();
                  navigate(`/tours/${tourId}`);
                }}
              >
                Book Tour Package
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Interactive 360° Panorama Viewport */}
        <div
          style={{
            position: 'relative',
            height: '360px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            cursor: 'grab',
            border: '2px solid var(--brand-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
          onMouseMove={(e) => {
            if (e.buttons === 1) {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              setPanX(Math.max(0, Math.min(100, percent)));
            }
          }}
        >
          {/* Panoramic Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: '200% 100%',
              backgroundPosition: `${panX}% center`,
              transition: 'background-position 0.1s ease-out',
            }}
          />

          {/* 360° Watermark Badge */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <RotateCw size={14} className="spin-slow" /> 360° INTERACTIVE PANORAMA VIEW
          </div>

          {/* Audio Commentary Badge */}
          <button
            type="button"
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              backgroundColor: isPlayingAudio ? '#16a34a' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Volume2 size={14} /> {isPlayingAudio ? 'Audio Guide Active (Ranger Abebe)' : 'Listen to Audio Guide'}
          </button>
        </div>

        {/* Info Box */}
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={24} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Authentic 360° Sightseeing Captured in HD:</strong> Enjoy panoramic views of {destinationName}. Certified ranger guides escort all in-person visitors.
          </div>
        </div>
      </div>
    </Modal>
  );
};
