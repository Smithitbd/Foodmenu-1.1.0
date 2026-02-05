import React, { useState } from 'react';
import { FaChair } from 'react-icons/fa';

const TablePicker = ({ onTableSelect }) => {
  //   API will place here
  const tables = [
    { id: 1, name: 'T-01', isAvailable: true },
    { id: 2, name: 'T-02', isAvailable: false },
    { id: 3, name: 'T-03', isAvailable: true },
    { id: 4, name: 'T-04', isAvailable: true },
    { id: 5, name: 'T-05', isAvailable: false },
    { id: 6, name: 'T-06', isAvailable: true },
    { id: 7, name: 'T-07', isAvailable: true },
    { id: 8, name: 'T-08', isAvailable: false },
  ];

  const [selectedTable, setSelectedTable] = useState(null);

  const handleSelect = (table) => {
    if (table.isAvailable) {
      setSelectedTable(table.id);
      onTableSelect(table.name); 
    }
  };

  return (
    <div style={container}>
      <style>{`
        .table-item { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .table-item:active { transform: scale(0.95); }
      `}</style>

      <div style={headerArea}>
        <p style={title}>Floor Plan / Table Selection</p>
        <div style={legend}>
           <div style={legendItem}><span style={{...dot, background: '#2ecc71'}}></span> Free</div>
           <div style={legendItem}><span style={{...dot, background: '#cbd5e1'}}></span> Booked</div>
        </div>
      </div>

      <div style={grid}>
        {tables.map((table) => (
          <div 
            key={table.id}
            className="table-item"
            onClick={() => handleSelect(table)}
            style={{
              ...tableBox,
              background: !table.isAvailable ? '#f1f5f9' : selectedTable === table.id ? '#be1e2d' : '#fff',
              borderColor: !table.isAvailable ? '#e2e8f0' : selectedTable === table.id ? '#be1e2d' : '#f1f5f9',
              cursor: table.isAvailable ? 'pointer' : 'not-allowed',
              color: selectedTable === table.id ? '#fff' : !table.isAvailable ? '#cbd5e1' : '#1e293b',
              boxShadow: selectedTable === table.id ? '0 8px 15px rgba(190,30,45,0.2)' : 'none'
            }}
          >
            <FaChair size={16} style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '11px', fontWeight: '800' }}>{table.name}</span>
            
            {/* Status Small Text */}
            <span style={{ fontSize: '7px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 'bold', opacity: 0.8 }}>
              {table.isAvailable ? (selectedTable === table.id ? 'Active' : 'Pick') : 'Full'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Styles ---
const container = { 
  marginTop: '20px', 
  padding: '20px', 
  background: '#fff', 
  borderRadius: '24px', 
  border: '1.5px solid #f1f5f9' 
};

const headerArea = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const title = { fontSize: '12px', fontWeight: '800', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' };

const legend = { display: 'flex', gap: '10px' };
const legendItem = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: '700', color: '#94a3b8' };
const dot = { width: '6px', height: '6px', borderRadius: '50%' };

const grid = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(4, 1fr)', 
  gap: '10px' 
};

const tableBox = { 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '12px 5px', 
  borderRadius: '16px', 
  border: '2px solid', 
  position: 'relative',
  overflow: 'hidden'
};

export default TablePicker;