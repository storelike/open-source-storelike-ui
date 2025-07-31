import React from "react";
import { CMSProvider } from "./CmsPreviewContext";

export const CMSRootProvider = ({ children }: { children: React.ReactNode }) => {
  return <CMSProvider>{children}</CMSProvider>;
};
