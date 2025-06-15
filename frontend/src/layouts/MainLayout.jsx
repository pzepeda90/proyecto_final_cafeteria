import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout; 