import * as React from "react";
import { useDebouncedValue } from "./useDebouncedValue";

type Id = string | number;

export type AutocompleteItem = {
  id: Id;
  label: string;
  description?: string;
};

type Props<T extends AutocompleteItem> = {
  value: string;
  onValueChange: (next: string) => void;
  loadOptions: (query: string) => Promise<T[]>;
  onSelect: (item: T) => void;
  placeholder?: string;
  minChars?: number;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  renderItem?: (item: T, isActive: boolean) => React.ReactNode;
  getItemLabel?: (item: T) => string;
};

export function Autocomplete<T extends AutocompleteItem>({
  value,
  onValueChange,
  loadOptions,
  onSelect,
  placeholder = "Search...",
  minChars = 2,
  debounceMs = 250,
  disabled,
  className,
  renderItem,
  getItemLabel = (i) => i.label,
}: Props<T>) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<T[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [error, setError] = React.useState<string | null>(null);

  const debounced = useDebouncedValue(value, debounceMs);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const requestSeq = React.useRef(0);

  React.useEffect(() => {
    const q = debounced.trim();
    setError(null);

    if (!open) return;

    if (q.length < minChars) {
      setOptions([]);
      setActiveIndex(-1);
      setLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);

    loadOptions(q)
      .then((items) => {
        if (seq !== requestSeq.current) return;
        setOptions(items);
        setActiveIndex(items.length ? 0 : -1);
      })
      .catch((e) => {
        if (seq !== requestSeq.current) return;
        setOptions([]);
        setActiveIndex(-1);
        setError(e instanceof Error ? e.message : "Failed to load results");
      })
      .finally(() => {
        if (seq !== requestSeq.current) return;
        setLoading(false);
      });
  }, [debounced, open, minChars, loadOptions]);

  React.useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const selectAt = React.useCallback(
    (idx: number) => {
      const item = options[idx];
      if (!item) return;
      onSelect(item);
      onValueChange(getItemLabel(item));
      setOpen(false);
      inputRef.current?.focus();
    },
    [options, onSelect, onValueChange, getItemLabel]
  );

  const listId = React.useId();

  return (
    <div ref={rootRef} className={className} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onValueChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
          }
          if (!open) return;

          if (e.key === "Escape") {
            setOpen(false);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter") {
            if (activeIndex >= 0) {
              e.preventDefault();
              selectAt(activeIndex);
            }
          }
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
        }
        autoComplete="off"
      />

      {open &&
        (loading ||
          error ||
          options.length > 0 ||
          debounced.trim().length >= minChars) && (
          <div
            id={listId}
            role="listbox"
            style={{
              position: "absolute",
              zIndex: 50,
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 6,
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 8,
              background: "white",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              maxHeight: 280,
              overflow: "auto",
            }}
          >
            {loading && (
              <div style={{ padding: 10, fontSize: 14, opacity: 0.7 }}>
                Loading…
              </div>
            )}

            {!loading && error && (
              <div style={{ padding: 10, fontSize: 14, color: "#b00020" }}>
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              options.length === 0 &&
              debounced.trim().length >= minChars && (
                <div style={{ padding: 10, fontSize: 14, opacity: 0.7 }}>
                  No results
                </div>
              )}

            {!loading &&
              !error &&
              options.map((item, idx) => {
                const active = idx === activeIndex;
                return (
                  <div
                    key={item.id}
                    id={`${listId}-opt-${idx}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectAt(idx)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: active ? "rgba(0,0,0,0.06)" : "transparent",
                    }}
                  >
                    {renderItem ? (
                      renderItem(item, active)
                    ) : (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {getItemLabel(item)}
                        </div>
                        {item.description ? (
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.75,
                              marginTop: 2,
                            }}
                          >
                            {item.description}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
    </div>
  );
}

