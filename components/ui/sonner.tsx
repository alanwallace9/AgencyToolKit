"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      {/* Custom CSS for premium glass toast styling */}
      <style jsx global>{`
        /* Override default slide animation to come from right */
        [data-sonner-toaster] [data-sonner-toast][data-mounted="true"] {
          animation: slideInFromRight 0.3s ease-out;
        }

        [data-sonner-toaster] [data-sonner-toast][data-removed="true"] {
          animation: slideOutToRight 0.2s ease-in forwards;
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutToRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        /* Premium glass success toast */
        [data-sonner-toast][data-type="success"] {
          background: rgba(240, 253, 244, 0.75) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1.5px solid rgba(22, 101, 52, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(22, 101, 52, 0.1) !important;
        }

        [data-sonner-toast][data-type="success"] [data-title] {
          color: #14532d !important;
          font-weight: 500 !important;
        }

        [data-sonner-toast][data-type="success"] [data-description] {
          color: #166534 !important;
        }

        [data-sonner-toast][data-type="success"] [data-icon] svg {
          color: #16a34a !important;
        }

        /* Premium glass error toast */
        [data-sonner-toast][data-type="error"] {
          background: rgba(254, 242, 242, 0.75) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1.5px solid rgba(153, 27, 27, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(153, 27, 27, 0.1) !important;
        }

        [data-sonner-toast][data-type="error"] [data-title] {
          color: #7f1d1d !important;
          font-weight: 500 !important;
        }

        /* Premium glass info toast */
        [data-sonner-toast][data-type="info"] {
          background: rgba(239, 246, 255, 0.75) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1.5px solid rgba(30, 64, 175, 0.4) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(30, 64, 175, 0.1) !important;
        }

        [data-sonner-toast][data-type="info"] [data-title] {
          color: #1e3a8a !important;
          font-weight: 500 !important;
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        position="top-right"
        offset="72px"
        closeButton
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toaster]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
