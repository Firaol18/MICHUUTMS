import React, { useState } from 'react';
import { QrCode, Copy, Check, Smartphone, Building2, UploadCloud, X, ZoomIn } from 'lucide-react';
import { Button } from './Button';

export interface EthiopianPaymentQRProps {
  method: 'telebirr' | 'cbe_birr' | 'bank_transfer' | 'credit_card' | 'cash';
  amountUsd: number;
  accountNumber: string;
  accountName: string;
  onReceiptUpload: (url: string, fileName: string) => void;
  receiptUrl?: string;
  receiptFileName?: string;
  onRemoveReceipt?: () => void;
}

const ETB_EXCHANGE_RATE = 135; // 1 USD ~ 135 ETB approx

export const EthiopianPaymentQR: React.FC<EthiopianPaymentQRProps> = ({
  method,
  amountUsd,
  accountNumber,
  accountName,
  onReceiptUpload,
  receiptUrl,
  receiptFileName,
  onRemoveReceipt,
}) => {
  const [copied, setCopied] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  const amountEtb = Math.round(amountUsd * ETB_EXCHANGE_RATE);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        onReceiptUpload(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  if (method === 'cash') {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
        <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.25rem' }}>💵 Pay Cash at MICHUU Bole Hub</div>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Your reservation will be held in pending status. You can settle the payment at our Bole Medhanialem Tower office (4th Floor) or pay your Eco-Ranger Guide upon expedition departure.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Account Info Box */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
              {method === 'telebirr' ? 'Telebirr Phone / Merchant No.' : method === 'cbe_birr' ? 'CBE Account Number' : 'Bank Account Number'}
            </span>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--brand-primary)' }}>
              {accountNumber}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Recipient: {accountName}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
          >
            {copied ? 'Copied' : 'Copy Number'}
          </Button>
        </div>

        {/* Currency Equivalent Box */}
        <div
          style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <span>Pay in Ethiopian Birr (ETB):</span>
          <strong style={{ fontSize: 'var(--font-size-sm)', color: '#16a34a' }}>
            ~ {amountEtb.toLocaleString()} ETB <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(${amountUsd} USD)</span>
          </strong>
        </div>

        {/* Scan to Pay QR Graphic (for Telebirr & CBE) */}
        {(method === 'telebirr' || method === 'cbe_birr') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              backgroundColor: method === 'telebirr' ? 'rgba(6,182,212,0.06)' : 'rgba(139,92,246,0.06)',
              borderRadius: 'var(--radius-sm)',
              border: `1px dashed ${method === 'telebirr' ? 'rgba(6,182,212,0.3)' : 'rgba(139,92,246,0.3)'}`,
            }}
          >
            {/* Stylized QR placeholder SVG with scan target */}
            <div
              style={{
                width: 68,
                height: 68,
                backgroundColor: '#fff',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="15" y="15" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="10" height="10" fill="#0f172a" />

                <rect x="60" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="65" y="15" width="20" height="20" fill="white" />
                <rect x="70" y="20" width="10" height="10" fill="#0f172a" />

                <rect x="10" y="60" width="30" height="30" fill="#0f172a" />
                <rect x="15" y="65" width="20" height="20" fill="white" />
                <rect x="20" y="70" width="10" height="10" fill="#0f172a" />

                <rect x="50" y="50" width="15" height="15" fill="#0f172a" />
                <rect x="70" y="70" width="20" height="20" fill="#0f172a" />
                <rect x="75" y="50" width="10" height="10" fill="#0f172a" />
                <rect x="50" y="75" width="10" height="10" fill="#0f172a" />
              </svg>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {method === 'telebirr' ? '📱 Scan with Telebirr App / *127#' : '🏦 Scan with CBE Mobile / *847#'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '0.2rem' }}>
                Open your mobile app, scan the merchant QR code, complete transfer, and attach confirmation screenshot below.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Screenshot / Receipt Box */}
      <div>
        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
          📸 Upload Proof of Payment (Screenshot or Deposit Slip) *
        </label>

        <div
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />

          {receiptUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowZoom(true);
                }}
              >
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <div style={{ textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ fontWeight: 800, color: '#16a34a', display: 'block' }}>✓ Receipt Attached (Click to Zoom)</span>
                  <span style={{ color: 'var(--text-muted)' }}>{receiptFileName || 'receipt.jpg'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  icon={<ZoomIn size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowZoom(true);
                  }}
                >
                  Zoom
                </Button>
                {onRemoveReceipt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReceipt();
                    }}
                    style={{ color: '#ef4444' }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <UploadCloud size={24} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Click to browse or drop payment screenshot</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>JPEG, PNG, WebP or PDF up to 8MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal for Attached Receipt */}
      {showZoom && receiptUrl && (
        <div
          onClick={() => setShowZoom(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={receiptUrl}
              alt="Full Receipt"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
            />
            <button
              onClick={() => setShowZoom(false)}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
