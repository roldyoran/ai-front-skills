import { useState, useEffect, useCallback, useRef } from 'react';

interface SkillResult {
  title: string;
  slug: string;
  category: string;
  description: string;
}

interface SearchCommandProps {
  skills: SkillResult[];
  locale?: string;
}

export function SearchCommand({ skills, locale = 'es' }: SearchCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const results = query.trim()
    ? skills.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
      )
    : skills.slice(0, 6);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const handleSelect = useCallback((slug: string) => {
    const prefix = locale === 'es' ? '/es' : '';
    window.location.href = `${prefix}/skills/${slug}`;
    close();
  }, [locale, close]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Track mounted state to prevent immediate close
  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      const id = requestAnimationFrame(() => {
        mountedRef.current = false;
      });
      return () => {
        cancelAnimationFrame(id);
        mountedRef.current = false;
      };
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[activeIndex]) {
            handleSelect(results[activeIndex].slug);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [results, activeIndex, handleSelect, close]
  );

  const categoryIcons: Record<string, string> = {
    css: 'C',
    react: 'R',
    astro: 'A',
    tailwind: 'T',
    tools: 'H',
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center gap-3 border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:border-border-hover hover:text-text-secondary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="square" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search skills...</span>
        <kbd className="ml-8 flex items-center gap-1 border border-border bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-dim">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="search-backdrop"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (!mountedRef.current) close();
            }}
          />

          {/* Search Modal */}
          <div
            className="search-modal"
            role="dialog"
            aria-label="Search skills"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="search-input-wrapper">
              <svg className="h-5 w-5 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by title, category, or keyword..."
                className="search-input"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="search-kbd">ESC</kbd>
            </div>

            {/* Results */}
            <div className="search-results" ref={resultsRef}>
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-muted">
                  No results found for "{query}"
                </div>
              ) : (
                results.map((skill, index) => (
                  <a
                    key={skill.slug}
                    href={`${locale === 'es' ? '/es' : ''}/skills/${skill.slug}`}
                    className={`search-result-item ${index === activeIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(skill.slug);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="search-result-icon flex items-center justify-center w-6 h-6 border border-border bg-bg-secondary text-[10px] font-bold text-text-dim">
                      {categoryIcons[skill.category] || '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{skill.title}</div>
                      <div className="text-xs text-text-dim truncate">{skill.description}</div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] text-text-dim uppercase tracking-wider border border-border px-1.5 py-0.5">
                      {skill.category}
                    </span>
                  </a>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="search-footer">
              <span className="flex items-center gap-1.5">
                <kbd className="search-kbd">↑</kbd>
                <kbd className="search-kbd">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="search-kbd">↵</kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="search-kbd">ESC</kbd>
                <span>Close</span>
              </span>
              <span className="ml-auto">{results.length} results</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
