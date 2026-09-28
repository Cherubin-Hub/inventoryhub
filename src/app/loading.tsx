export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center space-y-4">
        {/* A simple Tailwind CSS spinning circle */}
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading data...</p>
      </div>
    </div>
  );
}