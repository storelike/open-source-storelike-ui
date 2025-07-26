import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

import MainLayoutReact from '../../../components/react-components/app-react/main-layout-react';
import ErrorPage404React from '../../../components/react-components/app-react/error-page-404-react';

import ThankYouPageReact from '../../../components/react-components/thank-you-react';
import CallToActionPage from './call-to-action-page';


const AppReact: React.FC = () => { 
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayoutReact />} errorElement={<ErrorPage404React />}>  
        <Route path="/thank-you" element={<ThankYouPageReact />} />
        <Route path="/call-to-action" element={<CallToActionPage />} />      
        {/* <Route path="*" element={<ErrorPage404React />} /> */}
      </Route>
    ),
    {
      future: {       
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      }
    }
  );


  return (<RouterProvider router={router} future={{
      v7_startTransition: true,
    }} />
  );
};

export default AppReact;
