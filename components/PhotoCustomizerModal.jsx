'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function PhotoCustomizerModal({ isOpen, imageSrc, onClose, onSave }) {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setImgLoaded(true);
        
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (!isOpen || !imgLoaded || !imgRef.current) return;
    renderCanvas();
  }, [isOpen, imgLoaded, scale, offsetX, offsetY, rotation]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    
    ctx.translate(size / 2 + offsetX, size / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const img = imgRef.current;
    
    const aspect = img.width / img.height;
    let drawW, drawH;
    if (aspect > 1) {
      drawH = size;
      drawW = size * aspect;
    } else {
      drawW = size;
      drawH = size / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSave(dataUrl);
    onClose();
  };

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1060 }}>
      <div
        className="modal-content-custom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '100%', borderColor: '#e2e8f0' }}
      >
        <div className="p-3 p-md-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <h4 className="h5 fw-bold text-dark mb-0">
              <i className="bi bi-crop text-warning me-2"></i> Customize &amp; Resize Photo
            </h4>
            <span className="small text-secondary">
              Zoom, pan, and rotate your image to frame your license portrait
            </span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="p-3 p-md-4">
          
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4 mb-4 p-3 rounded-3 bg-light border" style={{ borderColor: '#e2e8f0' }}>
            
            <div className="text-center">
              <div
                className="overflow-hidden bg-white shadow-sm mx-auto position-relative"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '12px',
                  border: '2px solid #0284c7'
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
              <span className="small text-secondary fw-bold mt-2 d-block">
                Digital License Crop
              </span>
            </div>

            <div className="text-center">
              <div
                className="rounded-circle overflow-hidden bg-white shadow-sm mx-auto position-relative"
                style={{
                  width: '100px',
                  height: '100px',
                  border: '2px solid #0284c7'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <canvas
                    style={{
                      width: '100px',
                      height: '100px',
                      display: 'block'
                    }}
                    ref={(c) => {
                      if (c && canvasRef.current) {
                        const ctx = c.getContext('2d');
                        c.width = 100;
                        c.height = 100;
                        ctx.drawImage(canvasRef.current, 0, 0, 100, 100);
                      }
                    }}
                  />
                </div>
              </div>
              <span className="small text-secondary fw-bold mt-2 d-block">
                Profile Avatar
              </span>
            </div>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">
                  <i className="bi bi-zoom-in me-1"></i> Zoom / Resize Photo:
                </label>
                <span className="badge bg-light text-dark border">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">
                  <i className="bi bi-arrows-expand me-1" style={{ transform: 'rotate(45deg)' }}></i> Horizontal Offset (Pan X):
                </label>
                <span className="badge bg-light text-dark border">{offsetX}px</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="-120"
                max="120"
                step="2"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">
                  <i className="bi bi-arrows-expand me-1"></i> Vertical Offset (Pan Y):
                </label>
                <span className="badge bg-light text-dark border">{offsetY}px</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="-120"
                max="120"
                step="2"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between pt-1">
              <label className="form-label small fw-bold text-dark mb-0">
                <i className="bi bi-arrow-clockwise me-1"></i> Rotation:
              </label>
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> -90°
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> +90°
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-end gap-2 pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-warning btn-sm fw-bold shadow-sm"
              onClick={handleApply}
            >
              <i className="bi bi-check2-circle me-1"></i> Save &amp; Apply Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
