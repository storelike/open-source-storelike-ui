import React, { useEffect, useState } from 'react';
import { cmFooter } from '../../../../locale/cms-locale.json';

// Интерфейс для ссылки
interface Link {
  path: string;
  label: string;
  isActive: boolean;
}

const LinksListFooterReact: React.FC = () => {
  // Определяем состояние для хранения ссылок
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    // Фильтруем только активные ссылки и берём не более 4
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