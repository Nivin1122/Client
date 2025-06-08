import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import debounce from "lodash/debounce";
import { useSearchParams } from "react-router-dom";
import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const FilterSidebar = React.memo(({ onApplyFilters }) => {
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [accordionOpen, setAccordionOpen] = useState({
    sortBy: true,
    priceRange: true,
    categories: true,
  });

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [selectedFilters, setSelectedFilters] = useState(() => {
    const category = searchParams.get("category");
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 10000;
    const sortBy = searchParams.get("sortBy") || "newest";

    return {
      categories: category ? [category] : [],
      priceRange: { min: minPrice, max: maxPrice },
      sortBy,
    };
  });

  const [priceInputValues, setPriceInputValues] = useState({
    min: selectedFilters.priceRange.min.toString(),
    max: selectedFilters.priceRange.max.toString(),
  });

  const debouncedApplyFilters = useMemo(
    () =>
      debounce((filters) => {
        const params = new URLSearchParams();
        
        // Handle categories - use first category as main category
        if (filters.categories && filters.categories.length > 0) {
          params.set("category", filters.categories[0]);
        }

        // Handle price range
        if (filters.priceRange) {
          params.set("minPrice", filters.priceRange.min);
          params.set("maxPrice", filters.priceRange.max);
        }

        // Handle sort
        if (filters.sortBy) {
          params.set("sortBy", filters.sortBy);
        }
        setSearchParams(params, { replace: true });
        onApplyFilters(filters);
      }, 300),
    [onApplyFilters, setSearchParams]
  );

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const categoriesRes = await axiosInstance.get("/categories");
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    setPriceInputValues({
      min: selectedFilters.priceRange.min.toString(),
      max: selectedFilters.priceRange.max.toString(),
    });
  }, [selectedFilters.priceRange.min, selectedFilters.priceRange.max]);

  const handleFilterChange = useCallback(
    (filterType, value) => {
      setSelectedFilters((prev) => {
        let newFilters;
        if (filterType === "priceRange") {
          newFilters = { ...prev, [filterType]: value };
        } else if (filterType === "categories") {
          // For categories, we only want to keep one category selected at a time
          newFilters = {
            ...prev,
            categories: prev.categories.includes(value) ? [] : [value]
          };
        } else {
          newFilters = {
            ...prev,
            [filterType]: prev[filterType].includes(value)
              ? prev[filterType].filter((item) => item !== value)
              : [...prev[filterType], value],
          };
        }
        debouncedApplyFilters(newFilters);
        return newFilters;
      });
    },
    [debouncedApplyFilters]
  );

  const handleSortChange = useCallback((sortValue) => {
    const newFilters = { ...selectedFilters, sortBy: sortValue };
    setSelectedFilters(newFilters);
    debouncedApplyFilters(newFilters);
  });

  const handleResetFilters = useCallback(() => {
    const initialFilters = {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      sortBy: "newest",
    };
    setSelectedFilters(initialFilters);
    debouncedApplyFilters(initialFilters);
  });

  const handlePriceSliderChange = useCallback(
    (value) => {
      setSelectedFilters((prev) => {
        const newFilters = {
          ...prev,
          priceRange: Array.isArray(value)
            ? { min: value[0], max: value[1] }
            : { min: 0, max: value },
        };
        debouncedApplyFilters(newFilters);
        return newFilters;
      });
    },
    [debouncedApplyFilters]
  );

  const handlePriceInputChange = useCallback(
    (type, value) => {
      setPriceInputValues((prev) => ({
        ...prev,
        [type]: value,
      }));

      if (value === "") {
        const newValue = type === "min" ? 0 : 10000;
        const newRange = {
          ...selectedFilters.priceRange,
          [type]: newValue,
        };

        const newFilters = { ...selectedFilters, priceRange: newRange };
        debouncedApplyFilters(newFilters);
        return;
      }

      const numValue = Number(value);
      if (isNaN(numValue)) return;

      setSelectedFilters((prev) => {
        const newRange = {
          ...prev.priceRange,
          [type]: Math.min(Math.max(numValue, 0), 10000),
        };

        if (type === "min" && newRange.min > newRange.max) {
          newRange.max = newRange.min;
        } else if (type === "max" && newRange.max < newRange.min) {
          newRange.min = newRange.max;
        }

        const newFilters = { ...prev, priceRange: newRange };
        debouncedApplyFilters(newFilters);
        return newFilters;
      });
    },
    [debouncedApplyFilters, selectedFilters.priceRange]
  );

  return (
    <div className="w-64 bg-white p-4 border-r border-gray-200">
      {/* Sort By */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleAccordion("sortBy")}
        >
          <h3 className="text-lg font-semibold">Sort By</h3>
          <span>{accordionOpen.sortBy ? "−" : "+"}</span>
        </div>
        {accordionOpen.sortBy && (
          <select
            className="w-full p-2 border rounded"
            value={selectedFilters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </select>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleAccordion("priceRange")}
        >
          <h3 className="text-lg font-semibold">Price Range</h3>
          <span>{accordionOpen.priceRange ? "−" : "+"}</span>
        </div>
        {accordionOpen.priceRange && (
          <>
            <div className="px-2 mb-4">
              <Slider
                range
                min={0}
                max={10000}
                step={100}
                value={[
                  selectedFilters.priceRange.min,
                  selectedFilters.priceRange.max,
                ]}
                onChange={handlePriceSliderChange}
                trackStyle={[{ backgroundColor: "black" }]}
                handleStyle={[
                  { backgroundColor: "black", borderColor: "black" },
                  { backgroundColor: "black", borderColor: "black" },
                ]}
                railStyle={{ backgroundColor: "#e5e7eb" }}
              />
              <div className="flex justify-between mt-2 text-sm">
                <span>Rs. {selectedFilters.priceRange.min}</span>
                <span>Rs. {selectedFilters.priceRange.max}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  value={priceInputValues.min}
                  onChange={(e) =>
                    handlePriceInputChange("min", e.target.value)
                  }
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      handlePriceInputChange("min", "0");
                    }
                  }}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  value={priceInputValues.max}
                  onChange={(e) =>
                    handlePriceInputChange("max", e.target.value)
                  }
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      handlePriceInputChange("max", "10000");
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleAccordion("categories")}
        >
          <h3 className="text-lg font-semibold">Categories</h3>
          <span>{accordionOpen.categories ? "−" : "+"}</span>
        </div>
        {accordionOpen.categories && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedFilters.categories.includes(category._id)}
                  onChange={() =>
                    handleFilterChange("categories", category._id)
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100"
          onClick={handleResetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
});

export default FilterSidebar;
