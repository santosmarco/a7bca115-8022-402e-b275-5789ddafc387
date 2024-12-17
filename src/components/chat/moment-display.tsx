import { motion } from "framer-motion";

interface MomentDisplayProps {
  id: string;
  reasoning?: string;
}

export function MomentDisplay({ id, reasoning }: MomentDisplayProps) {
  return (
    <div className="space-y-2">
      <iframe
        src={`/embed/moments/${id}`}
        title={reasoning}
        className="w-full rounded-md"
        onLoad={(e) => {
          const iframe = e.currentTarget;
          const resizeObserver = new ResizeObserver(() => {
            const height =
              iframe.contentWindow?.document.documentElement.scrollHeight;
            if (height && height <= 400) iframe.style.height = `${height}px`;
          });
          if (iframe.contentWindow?.document.documentElement) {
            resizeObserver.observe(
              iframe.contentWindow?.document.documentElement,
            );
          }
        }}
      />
      {reasoning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs italic text-muted-foreground"
        >
          {reasoning}
        </motion.p>
      )}
    </div>
  );
}
