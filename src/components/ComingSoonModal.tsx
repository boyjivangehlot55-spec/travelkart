import React from 'react';

interface ComingSoonModalProps {
  isOpen: boolean;
  featureName?: string;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, featureName, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 text-[#065AF3] flex items-center justify-center shadow-inner">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {featureName ? `${featureName}` : 'Coming Soon'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          This feature is coming soon! Only Flights booking is enabled in this demo project.
        </p>
        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-[#065AF3] hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
