// components/Layout.js
import React from 'react';
import { HomeNavigation } from '../components/HomeNavigation';

function HomeLayout({ children }) {
  return (
    <div>
      <HomeNavigation />
      <div className="container">
            <div className="row row-cols-* g-4" style={{marginTop: "70px"}}>
                {children}
            </div>
        </div>
    </div>
  )
}

export default HomeLayout;
