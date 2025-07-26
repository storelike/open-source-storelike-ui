import React from 'react';
import { Outlet } from 'react-router-dom';


const MainLayoutReact: React.FC = () => {

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default MainLayoutReact;