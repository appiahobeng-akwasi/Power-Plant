import React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

function Drawer({ children, ...props }) {
  return <DrawerPrimitive.Root {...props}>{children}</DrawerPrimitive.Root>;
}

function DrawerTrigger({ children, ...props }) {
  return <DrawerPrimitive.Trigger {...props}>{children}</DrawerPrimitive.Trigger>;
}

function DrawerClose({ children, ...props }) {
  return <DrawerPrimitive.Close {...props}>{children}</DrawerPrimitive.Close>;
}

function DrawerPortal({ children, ...props }) {
  return <DrawerPrimitive.Portal {...props}>{children}</DrawerPrimitive.Portal>;
}

function DrawerOverlay({ className = "", ...props }) {
  return (
    <div>
      <DrawerPrimitive.Overlay
        className={`fixed inset-0 bg-black/40 ${className}`}
        style={{ zIndex: 200 }}
        {...props}
      />
    </div>
  );
}

function DrawerContent({ children, className = "", ...props }) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={`fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[20px] bg-white ${className}`}
        style={{ zIndex: 200 }}
        {...props}
      >
        <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-gray-200" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className = "", ...props }) {
  return (
    <div
      className={`px-6 pb-2 text-center ${className}`}
      {...props}
    />
  );
}

function DrawerTitle({ className = "", ...props }) {
  return (
    <DrawerPrimitive.Title
      className={`text-[18px] font-[600] text-forest ${className}`}
      {...props}
    />
  );
}

function DrawerDescription({ className = "", ...props }) {
  return (
    <DrawerPrimitive.Description
      className={`text-[13px] text-gray-500 ${className}`}
      {...props}
    />
  );
}

function DrawerFooter({ className = "", ...props }) {
  return (
    <div
      className={`px-6 pb-6 pt-2 ${className}`}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
};
