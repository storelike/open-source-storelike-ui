import React, { useEffect, useState } from 'react';
import LoadingWrapper from '../flatpages-react/content-flatpage';
import localeTextSite from "../../../locale/locale_text_site.json";

const HeroCustomReact: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); 
  useEffect(() => {
    const loadHtmlFragment = async () => {
      try {
        const response = await fetch('/fragmentHeroCustom.html'); 
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
   
      <LoadingWrapper loading={loading}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </LoadingWrapper>
      
    
  );
};

export default HeroCustomReact;