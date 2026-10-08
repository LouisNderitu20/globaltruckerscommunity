'use client';

import React from 'react';

export default function NewsSection({ news }) {
  const articles = news?.length ? news : [];

  return (
    <section id="news" className="py-4">
      <div className="container">
        
        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-newspaper me-1"></i> Dispatches &amp; Logs
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-1">Community News &amp; Debriefs</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Latest convoy announcements, route changes, road safety guidelines, and event highlights.
          </p>
        </div>

        <div className="row g-4">
          {articles.map((item, idx) => (
            <div key={item.id || idx} className="col-12 col-md-6 col-lg-4">
              <div className="card glass h-100 shadow-sm overflow-hidden">
                <div className="position-relative" style={{ height: '180px' }}>
                  <img
                    src={item.image || '/images/about-trucks.jpg'}
                    alt={item.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="badge badge-gold position-absolute top-0 start-0 m-3 shadow-sm">
                    <i className="bi bi-tag-fill me-1"></i> {item.badge || item.type}
                  </span>
                </div>

                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="small text-secondary mb-2">
                      <i className="bi bi-calendar3 me-1"></i> {item.date} &bull; <i className="bi bi-clock me-1"></i> {item.readTime || '3 min read'}
                    </div>
                    <h3 className="h6 fw-bold text-dark mb-2 lh-base">{item.title}</h3>
                    <p className="small text-secondary mb-0">{item.excerpt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
