import React from "react";
import { Link } from 'react-router-dom';
import "./Header.css";

const Header = () => {
        return (
            <nav className="header navbar sticky-top navbar-expand-lg">
                <a className="navbar-brand" href="/">Fit Monkeys</a>
                <div>
                    <Link to="/" className="btn btn-link text-secondary">
                        <span className="text-secondary">Home</span>
                    </Link>
                    <Link to="/login" className="btn btn-link text-secondary">
                        <span className="text-secondary">Login</span>
                    </Link>
                    <Link to="/signup" className="btn btn-link">
                        <span className="text-secondary">Sign up</span>
                    </Link>
                </div>
            </nav>
        )
    }

export default Header;