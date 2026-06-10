export default function EmptyState({ title = 'Nothing here yet', message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-5xl mb-4 text-stone-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-stone-700 mb-2">{title}</h3>
      {message && <p className="text-stone-400 text-sm max-w-xs">{message}</p>}
    </div>
  );
}
