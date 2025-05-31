import React, { useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showCloseButton?: boolean;
  custom_class?: string;
  closable?: boolean;
  destroyOnClose?: boolean;
  centered?: boolean;
  footer?: React.ReactNode;
  showFullscreenToggle?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  custom_class = "",
  closable = true,
  destroyOnClose = false,
  centered = true,
  footer,
  showFullscreenToggle = false,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleClose = useCallback(() => {
    if (closable) {
      onClose();
    }
  }, [closable, onClose]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        handleClose();
      }
    },
    [closable, handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Don't render anything if modal is not open and destroyOnClose is true
  if (!isOpen && destroyOnClose) return null;

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const fullscreenClasses = isFullscreen
    ? "max-w-full h-full m-0 rounded-none"
    : `${sizeClasses[size]} mx-4`;

  const heightClasses = isFullscreen
    ? "h-full"
    : size === "full"
    ? "h-[95vh]"
    : "max-h-[90vh]";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        centered
          ? "items-center justify-center"
          : "items-start justify-center pt-16"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-blur bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={closable ? handleClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white shadow-xl w-full flex flex-col",
          fullscreenClasses,
          heightClasses,
          !isFullscreen && "rounded-lg",
          custom_class
        )}
        role="document"
      >
        {/* Header - Fixed Height */}
        <div
          className={cn(
            "flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0",
            isFullscreen && "border-b-2"
          )}
        >
          <h3
            id="modal-title"
            className="text-lg font-semibold text-gray-900 truncate pr-4"
            title={title}
          >
            {title}
          </h3>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Fullscreen Toggle */}
            {showFullscreenToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Close Button */}
            {showCloseButton && closable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content - Flexible Height with Internal Scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full p-6">{children}</div>
        </div>

        {/* Footer - Fixed Height */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.displayName = "Modal";

export { Modal };
