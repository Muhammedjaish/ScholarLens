import React, { useState } from 'react';
import { Check, Copy, BookOpen, Layers, Lightbulb, Compass, AlertCircle, Quote } from 'lucide-react';

export default function SummaryViewer({ summary, bibtex, paperTitle }) {
  const [activeTab, setActiveTab] = useState('executive');
  const [copied, setCopied] = useState(false);

  if (!summary) {
    return (
      <div className="academic-card" style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--bg-subtle)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          No structured synthesis has been generated for this paper yet.
        </p>
      </div>
    );
  }

  const handleCopyBibtex = () => {
    if (bibtex) {
      navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'executive', label: 'Executive Overview', icon: BookOpen },
    { id: 'findings', label: 'Key Findings', icon: Lightbulb },
    { id: 'methodology', label: 'Methodology', icon: Layers },
    { id: 'lay', label: 'Plain Language', icon: Compass },
    { id: 'limitations', label: 'Limitations & Scope', icon: AlertCircle },
    { id: 'bibtex', label: 'BibTeX Citation', icon: Quote },
  ];

  return (
    <div className="academic-card" style={{ overflow: 'hidden' }}>
      
      {/* Engine & Metadata Bar */}
      <div style={{ padding: '0.85rem 1.5rem', backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Structured Synthesis
          </span>
          <span className="badge badge-success" style={{ backgroundColor: summary.generator_type === 'NEMOTRON_LLM' ? '#f0fdf4' : undefined, color: summary.generator_type === 'NEMOTRON_LLM' ? '#166534' : undefined, borderColor: summary.generator_type === 'NEMOTRON_LLM' ? '#bbf7d0' : undefined }}>
            {summary.generator_type === 'NEMOTRON_LLM'
              ? '⚡ NVIDIA Nemotron 3 Ultra'
              : summary.generator_type === 'AI_LLM'
              ? 'AI Language Model'
              : 'Deterministic Academic NLP'}
          </span>
        </div>

        {summary.keywords && summary.keywords.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {summary.keywords.slice(0, 4).map((kw, idx) => (
              <span key={idx} style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="tab-list" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{ padding: '1.75rem' }}>
        
        {/* 1. Executive Summary */}
        {activeTab === 'executive' && (
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Core Research Problem & Synthesis
            </h4>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: '6px', borderLeft: '4px solid var(--accent-primary)' }}>
              {summary.executive_summary}
            </div>
          </div>
        )}

        {/* 2. Key Findings */}
        {activeTab === 'findings' && (
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Empirical Findings & Contributions
            </h4>
            {summary.key_findings && summary.key_findings.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {summary.key_findings.map((item, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No bulleted findings extracted.</p>
            )}
          </div>
        )}

        {/* 3. Methodology */}
        {activeTab === 'methodology' && (
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Architecture, Formulation & Methodology
            </h4>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
              {summary.methodology || 'No specific methodology breakdown available.'}
            </p>
          </div>
        )}

        {/* 4. Layperson Explanation */}
        {activeTab === 'lay' && (
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Plain-Language Explanation (Non-Specialist Summary)
            </h4>
            <div style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-muted)', backgroundColor: '#fcfcfc', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '6px' }}>
              {summary.lay_summary || 'No layperson rewrite available.'}
            </div>
          </div>
        )}

        {/* 5. Limitations & Future Directions */}
        {activeTab === 'limitations' && (
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Scientific Scope & Identified Limitations
            </h4>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
              {summary.limitations || 'No explicit constraints reported in abstract extraction.'}
            </p>
          </div>
        )}

        {/* 6. BibTeX Citation */}
        {activeTab === 'bibtex' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>
                BibTeX Reference Entry
              </h4>
              <button
                onClick={handleCopyBibtex}
                className="btn btn-secondary btn-sm"
              >
                {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy BibTeX'}
              </button>
            </div>
            <pre style={{ backgroundColor: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '6px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', lineHeight: 1.5 }}>
              {bibtex || '% BibTeX entry not generated yet'}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

