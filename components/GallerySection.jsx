'use client';

import React, { useState } from 'react';

export default function GallerySection({ gallery }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const photos = gallery?.length ? gallery : [
    { id: 'g1', title: 'Sunset Haul Through Scandinavia', game: 'ETS 2', src: '/images/about-trucks.jpg', author: 'Bryan Gaming' },
    { id: 'g2', title: 'Desert Sunset Convoy in Nevada', game: 'ATS', src: '/images/ats-art.jpg', author: 'HighwayKing_99' },
    { id: 'g3', title: 'Heavy Transport Crossing Germany', game: 'ETS 2', src: '/images/ets2-art.jpg', author: 'Klaus_Trucker' }
  ];

  const filteredPhotos = photos.filter((p) => {
    if (filter === 'ALL') return true;
    return p.game === filter;
  });

  return (
    <section id="gallery" className="py-4">
      <div className="container">
        
        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-camera-fill me-1"></i> Media Showcase
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-1">Convoy Gallery &amp; Screenshots</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Captured moments from our recent community convoys across European motorways and American interstates.
          </p>
        </div>

        <div className="d-flex justify-content-center gap-2 mb-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-warning' : 'btn-outline-secondary'}`}
          >
            All Screenshots
          </button>
          <button
            onClick={() => setFilter('ETS 2')}
            className={`btn btn-sm ${filter === 'ETS 2' ? 'btn-warning' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-truck me-1"></i> Euro Truck Simulator 2
          </button>
          <button
            onClick={() => setFilter('ATS')}
            className={`btn btn-sm ${filter === 'ATS' ? 'btn-warning' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-truck-front-fill me-1"></i> American Truck Simulator
          </button>
        </div>

        <div className="row g-4">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card glass overflow-hidden h-100 position-relative shadow-sm"
                style={{ cursor: 'pointer', minHeight: '260px' }}
                onClick={() => setActivePhoto(photo)}
                role="button"
                tabIndex={0}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                />
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.96) 80%)' }}
                >
                  <h5 className="fw-bold text-dark fs-6 mb-1">{photo.title}</h5>
                  <div className="small fw-semibold" style={{ color: '#0284c7' }}>
                    <i className="bi bi-controller me-1"></i> {photo.game} &bull; Photo by {photo.author || 'GTC Community'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activePhoto && (
          <div
            className="modal-backdrop-custom"
            onClick={() => setActivePhoto(null)}
          >
            <div
              className="card bg-white shadow-lg overflow-hidden position-relative"
              style={{ maxWidth: '900px', width: '100%', borderColor: '#e2e8f0' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="btn btn-light position-absolute top-0 end-0 m-3 z-3 rounded-circle p-2 text-dark shadow-sm"
                onClick={() => setActivePhoto(null)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>

              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="w-100 object-fit-contain bg-light"
                style={{ maxHeight: '580px' }}
              />

              <div className="p-4 d-flex justify-content-between align-items-center bg-white border-top">
                <div>
                  <h4 className="fw-bold text-dark fs-5 mb-1">{activePhoto.title}</h4>
                  <p className="text-secondary small mb-0">
                    Captured by <strong style={{ color: '#0284c7' }}>{activePhoto.author}</strong> in {activePhoto.game}
                  </p>
                </div>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
