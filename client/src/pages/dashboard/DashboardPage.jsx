import React, { useEffect } from 'react'
import SidebarComponent from '../../components/sidebar/SidebarComponent'
import ResponsiveNavComponent from '../../components/responsive-nav/ResponsiveNavComponent'

const DashboardPage = () => {

  useEffect(() => {
    document.title = 'ParkTunja - Dashboard';
  }, []);

  return (
    <div>
      <ResponsiveNavComponent />
      <div className="main-content">
        <SidebarComponent />
        <div className="sidebar-spacer"></div>
        <div className="parking-lots-container">

        </div>
      </div>
    </div>
  )
}

export default DashboardPage