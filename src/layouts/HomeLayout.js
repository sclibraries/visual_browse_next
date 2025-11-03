// components/Layout.js
import { HomeNavigation } from '../components/HomeNavigation';


function HomeLayout({ children }) {
  return (
    <div>
      <div style={{marginBottom: "20px"}}>
        <HomeNavigation />
      </div>
      <div>
            <div style={{marginTop: "70px"}}>
                {children}
            </div>
        </div>
    </div>
  )
}

export default HomeLayout;
