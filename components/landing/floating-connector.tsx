"use client"

export function FloatingConnector() {
  return (
    <div className="flex justify-center py-8 sm:py-12 lg:py-16">
      <div className="relative w-32 h-16 flex items-center justify-center">
        {/* Glowing horizontal line with circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Main line */}
          <div className="absolute w-24 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full blur-sm" />

          {/* Left circle */}
          <div className="absolute -left-4 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />

          {/* Center circle */}
          <div className="absolute w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/75" />

          {/* Right circle */}
          <div className="absolute -right-4 w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
