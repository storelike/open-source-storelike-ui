import React, { useEffect, useState } from 'react';
import { cmFooter } from '../../../../locale/cms-locale.json';

// Interface for a link
interface Link {
  path: string;
  label: string;
  isActive: boolean;
}

const LinksListFooterReact: React.FC = () => {
  // State that holds the links
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    // Keep only the active links, up to 4
    const activeLinks = (cmFooter.links as Link[]).filter(link => link.isActive);
    setLinks(activeLinks);
  }, []);

  return (
    <div className=" flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.path}
          className=" hover:underline"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default LinksListFooterReact;