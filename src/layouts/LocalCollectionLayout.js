// components/Layout.js
import React from 'react';

function LocalCollectionLayout({ children }) {
  return (
      <div className="container">
            <div className="row row-cols-* g-4" style={{marginTop: "70px"}}>
                {children}
            </div>
        </div>
  )
}

export default LocalCollectionLayout;
