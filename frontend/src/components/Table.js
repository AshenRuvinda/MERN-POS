import React from 'react';

const Table = ({ headers, data, renderRow }) => {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th key={idx} className="border p-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => renderRow(item, idx))}
      </tbody>
    </table>
  );
};

export default Table;