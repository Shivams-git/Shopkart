import { useState } from "react";

export default function SearchBar({
  search,
  category,
  sort,
  onSearch,
  onCategory,
  onSort,
}) {
  const [openFilter, setOpenFilter] = useState(null);

  return (
    <section className="filters" aria-label="Product filters">
      <label className="search-field">
        <span>Search</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search products..."
        />
      </label>
      <FilterDropdown
        id="category"
        label="Category"
        value={category}
        options={[
          { value: "", label: "All Categories" },
          { value: "Electronics", label: "Electronics" },
          { value: "Fashion", label: "Fashion" },
          { value: "Books", label: "Books" },
          { value: "Home", label: "Home" },
        ]}
        open={openFilter === "category"}
        onToggle={() =>
          setOpenFilter(openFilter === "category" ? null : "category")
        }
        onChange={onCategory}
        onClose={() => setOpenFilter(null)}
      />
      <FilterDropdown
        id="sort"
        label="Sort"
        value={sort}
        options={[
          { value: "", label: "Newest" },
          { value: "price_asc", label: "Price: low to high" },
          { value: "price_desc", label: "Price: high to low" },
        ]}
        open={openFilter === "sort"}
        onToggle={() => setOpenFilter(openFilter === "sort" ? null : "sort")}
        onChange={onSort}
        onClose={() => setOpenFilter(null)}
      />
    </section>
  );
}

function FilterDropdown({
  id,
  label,
  value,
  options,
  open,
  onToggle,
  onChange,
  onClose,
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="select-field filter-dropdown">
      <span className="filter-label">{label}</span>
      <button
        className="filter-select-trigger"
        type="button"
        aria-label={`${label}: ${selectedOption?.label || "Choose"}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`${id}-filter-menu`}
        onClick={onToggle}
      >
        <span>{selectedOption?.label}</span>
        <span
          className={`filter-chevron ${open ? "open" : ""}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>
      {open && (
        <div
          className="filter-select-menu"
          id={`${id}-filter-menu`}
          role="group"
          aria-label={`Choose ${label.toLowerCase()}`}
        >
          {options.map((option) => (
            <button
              className={`filter-select-option ${value === option.value ? "selected" : ""}`}
              key={option.value || "default"}
              type="button"
              aria-pressed={value === option.value}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span className="filter-option-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
