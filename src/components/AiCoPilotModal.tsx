import React from 'react';
import { X, Sparkles, Train, ShieldCheck } from 'lucide-react';
import { BlockRequest, User } from '../types';
import { AiCoPilotRecommendationEngine } from './AiCoPilotRecommendationEngine';

interface AiCoPilotModalProps {
  request: BlockRequest | null;
  allRequests: BlockRequest[];
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onApplyNightShift?: (updatedReq: BlockRequest) => void;
  onAttachTsr?: (updatedReq: BlockRequest) => void;
  onBundleAndApprove?: (bundledReqs: BlockRequest[]) => void;
  onFeedbackToast?: (message: string, type?: 'success' | 'info') => void;
}

export const AiCoPilotModal: React.FC<AiCoPilotModalProps> = ({
  request,
  allRequests,
  currentUser,
  isOpen,
  onClose,
  onApplyNightShift,
  onAttachTsr,
  onBundleAndApprove,
  onFeedbackToast,
}) => {
  if (!isOpen || !request) return null;

  // STRICT SECURITY CHECK: Only SECTION_CONTROLLER can view this modal
  if (currentUser.role !== 'SECTION_CONTROLLER') return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-[#000075] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white tracking-tight">
                  AI Co-Pilot Decision Desk & Train Simulation
                </h3>
                <span className="bg-amber-400 text-blue-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Indian Railways Delhi Division • Real-Time Movement Impact & Action Directives
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <AiCoPilotRecommendationEngine
            request={request}
            allRequests={allRequests}
            currentUser={currentUser}
            onApplyNightShift={(updated) => {
              if (onApplyNightShift) onApplyNightShift(updated);
            }}
            onAttachTsr={(updated) => {
              if (onAttachTsr) onAttachTsr(updated);
            }}
            onBundleAndApprove={(bundled) => {
              if (onBundleAndApprove) onBundleAndApprove(bundled);
            }}
            onFeedbackToast={onFeedbackToast}
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All directives write directly to Supabase with WebSocket notification dispatch.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors cursor-pointer"
            >
              Close Co-Pilot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
