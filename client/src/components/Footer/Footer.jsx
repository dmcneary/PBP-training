import React from "react";
import "./Footer.css";

const Footer = () => (

    <footer className="page-footer sticky font-small special-color-dark pt-4 foot">
        <div className="container">
            <div className="row">
                <div className="col-md-3 mb-md-0 mb-3">
                </div>
            </div>
            
            <div className="container text-center">
                <a href="https://github.com/dmcneary/final-project"><i className="fa fa-github"></i></a>
                <i className="fa fa-facebook"></i>
                <i className="fa fa-twitter"></i>
                <i className="fa fa-linkedin"></i>
                <i className="fa fa-google"></i>
            </div>
            <br></br><br></br>
            <div className="footer-copyright text-center py-3">© 2019 Copyright:
          <p>UCLA Bootcamp Final Project</p>
            </div>
        </div>
    </footer>
);

export default Footer;