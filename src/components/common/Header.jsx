/* eslint-disable no-mixed-spaces-and-tabs */
import { useNavigate } from "react-router-dom";

const Header = ({title}) => {


	const token = localStorage.getItem('token')
	const navigate = useNavigate(); // Hook to navigate programmatically
  
   // eslint-disable-next-line no-unused-vars
   const profileImage = localStorage.getItem('image')
  
	// Logout handler
	const handleLogout = () => {
	  localStorage.removeItem('token'); // Remove token from localStorage
	  localStorage.clear()
	  navigate('/login'); // Redirect to the login page
	};

	return (
		<header className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700'>
			<div className="navbar bg-[#182130]">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl">{title}</a>
  </div>
  <div className="flex-none gap-2">
    <div className="dropdown dropdown-end">
    {token ? (
  <button onClick={handleLogout} className="btn">Sign Out</button> // Use button for logout
) : (
  <a href="/login" className="btn">Sign In</a> // Use anchor for login
)}

      {/* <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src={`http://localhost:5000/${profileImage}`}/>P
        </div>
      </div> */}
      {/* <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-[#182130] rounded-box z-[1] mt-3 w-52 p-2 shadow border">
        <li>
          <a>
            Profile
          
          </a>
        </li>
        <li><a>Settings</a></li>
        <li >
		
		</li>
      </ul> */}
    </div>
  </div>
</div>
		</header>
	);
};
export default Header;
