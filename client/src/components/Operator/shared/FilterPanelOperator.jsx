import React, { useState, useEffect } from 'react';
import './FilterPanelOperator.css';

/**
 * Filter Panel dạng Toolbar hiện đại
 */
function FilterPanelOperator({ fields = [], onApply, onReset }) {
  const [localValues, setLocalValues] = useState({});

  useEffect(() => {
    const initial = {};
    fields.forEach(f => {
      initial[f.name] = f.value || ''; 
    });
    setLocalValues(prev => ({ ...prev, ...initial }));
  }, [fields]);

  const handleChange = (name, value) => {
    setLocalValues(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (onApply) onApply(localValues);
    }
  };

  return (
    <div className="filter-toolbar">
      {/* Khu vực Inputs */}
      <div className="filter-toolbar__inputs">
        {fields.map((field, index) => (
          <div key={index} className="filter-input-group">
            {/* Nếu có icon thì hiển thị, không thì thôi */}
            {field.icon && <span className="filter-input-icon">{field.icon}</span>}
            
            {field.type === 'select' ? (
              <select
                className="filter-control filter-control--select"
                value={localValues[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">{field.placeholder || `Tất cả ${field.label}`}</option>
                {field.options?.map((opt, idx) => (
                  <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                className="filter-control"
                placeholder={field.placeholder || field.label}
                value={localValues[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>
        ))}
      </div>

      {/* Khu vực Buttons - Thu gọn thành Icon Button hoặc nút nhỏ */}
      <div className="filter-toolbar__actions">
        <button 
          className="filter-btn filter-btn--apply"
          onClick={() => onApply && onApply(localValues)}
          title="Áp dụng bộ lọc"
        >
          🔍 Tìm
        </button>
        <button 
          className="filter-btn filter-btn--reset"
          onClick={() => {
            const resetData = fields.reduce((acc, curr) => ({...acc, [curr.name]: ''}), {});
            setLocalValues(resetData);
            if (onReset) onReset();
          }}
          title="Xóa bộ lọc"
        >
          🔄
        </button>
      </div>
    </div>
  );
}

export default FilterPanelOperator;
