import React, { useEffect, useState } from 'react';
import { cmFlatpagesAbout } from '../../../../locale/cms-locale.json';
import LoadingWrapper from '../content-flatpage';
import localeTextSite from "../../../../locale/locale_text_site.json";

const AboutReact: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); 
  useEffect(() => {
    const loadHtmlFragment = async () => {
      try {
        const response = await fetch('/fragmentAbout.html'); 
        if (response.ok) {
          const text = await response.text();
          setHtmlContent(text);
        } else {
          console.error(localeTextSite.components.reactComponents.flatpagesReact.errorLoadForm, response.status);
        }
      } catch (error) {
        console.error(localeTextSite.components.reactComponents.flatpagesReact.errorLoadForm, error);
      } finally {
        setLoading(false);
      }
    };

    loadHtmlFragment();
  }, []);

  return (
    <div className="mt-12 flex flex-col items-center min-h-screen rounded-lg">
      <h1 className="pt-10 text-4xl font-bold text-gray-800">{cmFlatpagesAbout.title.value}</h1>
      <LoadingWrapper loading={loading}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </LoadingWrapper>
      <a
        href="/"
        className="mb-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {localeTextSite.globalSettings.btnToMain}
      </a>
    </div>
  );
};

export default AboutReact;