import { Link } from 'react-router-dom';
import '../styles/header.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

export default function Header({ isLoggedIn }) {
  const { setUser } = useAuth(); // Assuming the context provides setUser for managing the auth state

  const logout = async () => {
    try {
      const response = await fetch('/api/users/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null); // Clear the user context
      localStorage.removeItem('userInfo'); // Remove user info from local storage
      window.location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className='header'>
      <svg className="title-img" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
      </svg>
      <h2 className="web-title">PixelSpeak</h2>

      {/* Conditionally render buttons if logged in */}
      {isLoggedIn && (
        <div className="header-buttons">
          <Link to="/language">
            <button className="choose-language-button">Choose Language</button>
          </Link>
          <Link to="/">
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </Link>
        </div>
      )}
    </header>
  );
}