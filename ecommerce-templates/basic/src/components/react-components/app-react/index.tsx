import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';

import MainLayoutReact from './main-layout-react';
import ErrorPage404React from './error-page-404-react';

import ThankYouPageReact from '../thank-you-react';
import CallToActionPage from './call-to-action-page';


const AppReactRouter: React.FC = () => { 
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayoutReact />} >  
        <Route path="/thank-you" element={<ThankYouPageReact />} />
        <Route path="/call-to-action" element={<CallToActionPage />} />      
        {/* <Route path="*" element={<ErrorPage404React />} /> */}
      </Route>
    )
  
  );


  return (<RouterProvider router={router}  />
  );
};

export default AppReactRouter;