import React from 'react'

function AccountLayout({ children }) {
  return (
    <div>
      <div className="hide-scrollbar flex-1 h-100 container">
        <div className="row row-cols-1 row-cols-md-4 g-4" style={{marginTop: "70px"}}>
                {children}
            </div>
        </div>
    </div>
  )
}