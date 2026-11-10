/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Info } from "lucide-react";

interface PipelineTrackerProps {
  status: string;
  loading: boolean;
  pipelineStep: number;
}

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({ status, loading, pipelineStep }) => {
  return (
    <AnimatePresence>
      {status && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="bg-indigo-50 p-2 rounded-xl shrink-0">
              {loading ? <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /> : <Info className="w-5 h-5 text-indigo-600" />}
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indigo-900 font-black uppercase tracking-widest">Pipeline Control</p>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                  {pipelineStep > 0 ? `${pipelineStep * 25}%` : 'Waiting'}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{status}</p>
              
              {/* Pipeline Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pipelineStep * 25}%` }}
                  className="h-full bg-indigo-600"
                />
              </div>

              {/* Pipeline Stages Labels */}
              <div className="grid grid-cols-4 gap-1">
                {['Analyze', 'Translate', 'Synthesize', 'Studio'].map((stage, i) => (
                  <div key={stage} className={`text-[8px] font-bold uppercase text-center ${pipelineStep > i ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
