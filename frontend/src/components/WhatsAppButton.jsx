import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const number = settings?.whatsapp_number?.replace(/\D/g, '');
  if (!number) return null;

  return (
    <motion.a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1 }}
      title="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
    </motion.a>
  );
}
