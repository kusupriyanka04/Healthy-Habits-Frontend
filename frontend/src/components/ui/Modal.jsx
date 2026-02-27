// import { motion, AnimatePresence } from 'framer-motion';
// import { X } from 'lucide-react';

// const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <motion.div
//             className="absolute inset-0"
//             style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />
//           <motion.div
//             className={`relative card p-6 w-full ${maxWidth} z-10`}
//             initial={{ opacity: 0, scale: 0.94, y: 16 }}
//             animate={{ opacity: 1, scale: 1,    y: 0  }}
//             exit={{    opacity: 0, scale: 0.94, y: 16 }}
//             transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
//           >
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="font-syne font-bold text-xl" style={{ color: 'var(--text)' }}>
//                 {title}
//               </h2>
//               <button
//                 onClick={onClose}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
//                 style={{ color: 'var(--text-faint)' }}
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             {children}
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Modal;

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children }) => {

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="relative w-full sm:max-w-lg flex flex-col"
              style={{
                background:    'var(--bg-card)',
                border:        '1px solid var(--border)',
                borderRadius:  '24px 24px 0 0',
                maxHeight:     '92vh',
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0,    y: 50  }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}>

              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden">
                <div className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--border)' }} />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border-muted)' }}>
                <h2
                  className="font-syne font-bold text-lg"
                  style={{
                    color:         'var(--text)',
                    fontFamily:    'var(--font-display)',
                    letterSpacing: '-0.02em',
                  }}>
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: 'var(--bg-muted)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-muted)',
                  }}
                  whileHover={{
                    color:      '#ef4444',
                    background: 'rgba(239,68,68,0.08)',
                    scale:      1.05,
                  }}
                  whileTap={{ scale: 0.92 }}>
                  <X size={15} />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div
                className="overflow-y-auto flex-1 px-6 py-5"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border) transparent',
                  fontFamily:     'var(--font-body)',
                }}>
                {children}
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;