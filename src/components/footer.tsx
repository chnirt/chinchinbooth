import React from "react";

export default function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} @chinchinbooth. All rights reserved.
      <br />
      <span className="text-xs">
        Version: {process.env.NEXT_PUBLIC_APP_VERSION}
      </span>
    </footer>
  );
}
