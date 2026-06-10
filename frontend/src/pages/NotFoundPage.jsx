import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-display text-9xl font-bold text-stone-100 select-none">404</p>
        <h1 className="font-display text-3xl font-bold text-stone-800 -mt-4 mb-3">Page Not Found</h1>
        <p className="text-stone-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="px-8 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
