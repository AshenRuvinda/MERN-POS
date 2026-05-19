import React from 'react';

const LoadingPage = ({ title, subtitle, footer }) => {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-black bg-white px-8 py-10 text-center shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-black" />

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-black bg-white">
          <div className="loading-ring">
            <span className="loading-ring-track" />
            <span className="loading-ring-sweep" />
            <span className="loading-ring-core" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-black">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>

        <div className="mt-8 flex items-center justify-center" aria-hidden="true">
          <div className="loading-bands">
            <span />
            <span />
            <span />
          </div>
        </div>

        {footer ? <p className="mt-6 text-xs text-gray-500">{footer}</p> : null}
      </div>
    </div>
  );
};

export default LoadingPage;