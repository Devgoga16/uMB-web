import Sidebar from './Sidebar';
import '../styles/Dashboard.css';

/**
 * Layout principal que incluye el Sidebar
 */
function Layout({ children }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
