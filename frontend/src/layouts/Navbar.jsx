import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdSearch, IoIosClose } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoMdNotificationsOutline } from "react-icons/io";
import axios from 'axios';
import Logo from '../Images/logo.png';
import { userContext } from '../hooks/AutoAuth';
import { API_BASE_URL } from '../utils/api';

const NavDropdown = ({ label, innerRef, isOpen, onToggle, children }) => (
    <div ref={innerRef} className='relative'>
        <button
            onClick={onToggle}
            className='flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors'
        >
            {label}
            <FaAngleDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <div className="absolute top-full left-0 mt-3 w-64 df-card shadow-2xl shadow-black/50 flex flex-col z-50 p-2 gap-1">
                {children}
            </div>
        )}
    </div>
);

const DropdownItem = ({ onClick, children }) => (
    <a
        onClick={onClick}
        href="#"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition-colors text-sm cursor-pointer"
    >
        {children}
    </a>
);

const Navbar = () => {
    const navigateto = useNavigate();
    const [showJoinDropdown, setShowJoinDropdown] = useState(false);
    const [showHostDropdown, setShowHostDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const joinRef = useRef(null);
    const hostRef = useRef(null);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const { User, loading, logout } = userContext();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (joinRef.current && !joinRef.current.contains(event.target)) setShowJoinDropdown(false);
            if (hostRef.current && !hostRef.current.contains(event.target)) setShowHostDropdown(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data?.data?.notifications || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        if (!User) return;
        fetchNotifications();
        const id = setInterval(fetchNotifications, 15000);
        return () => clearInterval(id);
    }, [User]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const toggleNotifications = async () => {
        setShowNotifications(p => !p);
        if (!showNotifications && unreadCount > 0) {
            const token = localStorage.getItem('token');
            try {
                await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            } catch (err) {
                console.error('Failed to mark notifications read:', err);
            }
        }
    };

    if (loading) return <div className='h-20 bg-[#0d0d1a]' />;

    const handleLogout = () => {
        logout();
        navigateto('/');
    };

    const checkIfLoggedin = () => {
        if (User) {
            navigateto('/hostingpage');
        } else {
            alert('You need to be logged in first');
            navigateto('/login');
        }
    };

    const runSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigateto(`/hackathons?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigateto('/hackathons');
        }
        setIsSearchVisible(false);
    };

    return (
        <div className='sticky top-0 z-50 bg-[#0a0a14] border-b border-white/15 shadow-lg shadow-black/40 w-full'>
            <div className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6'>
                <div className='flex items-center gap-8'>
                    <img
                        onClick={() => navigateto('/')}
                        className="h-11 w-auto object-contain cursor-pointer flex-shrink-0"
                        src={Logo}
                        alt="DevFiesta"
                    />

                    <div className='hidden md:flex items-center gap-6'>
                        <NavDropdown
                            label="Join a Hackathon"
                            innerRef={joinRef}
                            isOpen={showJoinDropdown}
                            onToggle={() => setShowJoinDropdown(p => !p)}
                        >
                            <DropdownItem onClick={() => { setShowJoinDropdown(false); navigateto('/hackathons'); }}>
                                🧭 Explore Hackathons
                            </DropdownItem>
                            <DropdownItem onClick={() => { setShowJoinDropdown(false); navigateto('/projects'); }}>
                                🔑 Explore Projects
                            </DropdownItem>
                            <DropdownItem onClick={() => { setShowJoinDropdown(false); navigateto('/pbl/login'); }}>
                                🎓 Join an Academic Hackathon
                            </DropdownItem>
                        </NavDropdown>

                        <NavDropdown
                            label="Host a Hackathon"
                            innerRef={hostRef}
                            isOpen={showHostDropdown}
                            onToggle={() => setShowHostDropdown(p => !p)}
                        >
                            <DropdownItem onClick={() => { setShowHostDropdown(false); navigateto('/hackathons'); }}>
                                🌍 Explore Hackathons
                            </DropdownItem>
                            <DropdownItem onClick={() => { setShowHostDropdown(false); checkIfLoggedin(); }}>
                                🚀 Host a Hackathon
                            </DropdownItem>
                            <DropdownItem onClick={() => { setShowHostDropdown(false); if (User) navigateto('/pbl/host'); else checkIfLoggedin(); }}>
                                🎓 Host an Academic Hackathon
                            </DropdownItem>
                            <DropdownItem onClick={() => { setShowHostDropdown(false); if (User) navigateto('/profileinfo'); else checkIfLoggedin(); }}>
                                🗂️ Your Participations
                            </DropdownItem>
                        </NavDropdown>
                    </div>
                </div>

                <div className='flex-1 flex items-center justify-end gap-4'>
                    {User ? (
                        isSearchVisible ? (
                            <form onSubmit={runSearch} className="w-full max-w-sm relative flex items-center">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search hackathons..."
                                    className="df-input !py-2 !pr-9 text-sm"
                                    autoFocus
                                />
                                <IoIosClose
                                    className="absolute right-2 h-6 w-6 text-gray-400 cursor-pointer hover:text-white"
                                    onClick={() => setIsSearchVisible(false)}
                                />
                            </form>
                        ) : (
                            <div className='flex items-center gap-4'>
                                <button onClick={() => setIsSearchVisible(true)} aria-label="Search" className='inline-flex items-center justify-center h-9 w-9 flex-shrink-0'>
                                    <IoMdSearch className='h-6 w-6 text-gray-300 hover:text-white transition-colors' />
                                </button>

                                <div ref={notifRef} className='relative flex items-center'>
                                    <button onClick={toggleNotifications} className='relative inline-flex items-center justify-center h-9 w-9 flex-shrink-0' aria-label="Notifications">
                                        <IoMdNotificationsOutline className='h-6 w-6 text-gray-300 hover:text-white transition-colors' />
                                        {unreadCount > 0 && (
                                            <span className='absolute top-1 right-1 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center'>
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 top-full mt-3 w-80 df-card shadow-2xl shadow-black/50 flex flex-col z-50 max-h-96 overflow-y-auto">
                                            <div className="px-4 py-3 border-b border-white/10 font-semibold text-white text-sm">
                                                Notifications
                                            </div>
                                            {notifications.length === 0 ? (
                                                <p className="text-gray-500 text-sm px-4 py-6 text-center">No notifications yet.</p>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div key={n.notification_id} className="px-4 py-3 border-b border-white/5 last:border-b-0 text-sm text-gray-200">
                                                        <p>{n.message}</p>
                                                        <p className="text-gray-500 text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div ref={profileRef} className='relative flex items-center h-9'>
                                    {User?.user?.image ? (
                                        <img
                                            src={User.user.image}
                                            onClick={() => setShowProfileDropdown(p => !p)}
                                            className='h-9 w-9 rounded-full cursor-pointer object-cover ring-2 ring-white/10'
                                            alt="Profile"
                                        />
                                    ) : (
                                        <CgProfile
                                            onClick={() => setShowProfileDropdown(p => !p)}
                                            className='cursor-pointer h-9 w-9 text-gray-300 hover:text-white transition-colors'
                                        />
                                    )}

                                    {showProfileDropdown && (
                                        <div className="absolute right-0 top-full mt-3 w-56 df-card shadow-2xl shadow-black/50 flex flex-col z-50 p-2 gap-1">
                                            <DropdownItem onClick={() => { setShowProfileDropdown(false); navigateto('/profileinfo'); }}>
                                                🧑‍💻 Portfolio
                                            </DropdownItem>
                                            <DropdownItem onClick={() => { setShowProfileDropdown(false); navigateto('/settings'); }}>
                                                ⚙️ Settings
                                            </DropdownItem>
                                            <DropdownItem onClick={handleLogout}>
                                                🔓 Logout
                                            </DropdownItem>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className='flex items-center gap-4'>
                            <button onClick={() => navigateto('/login')} className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>
                                Login
                            </button>
                            <button onClick={() => navigateto('/signup')} className='df-btn-primary !py-2 !px-5 text-sm'>
                                Sign up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
