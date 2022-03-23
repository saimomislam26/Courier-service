import React, {useContext} from 'react';
import { NavLink } from 'react-router-dom'
import {
    Nav,
    NavItem,
    Navbar,
    NavbarBrand,
    Collapse,
    DropdownItem,
    Button,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu
} from 'reactstrap';

import logodarkicon from '../../../assets/images/logo-icon.png';
// import logodarktext from '../../../assets/images/logo-text.png';
import profilephoto from '../../../assets/images/users/1.jpg';
import { GlobalContext } from '../../../context/ProjectContext';

const Header = () => {
    const {logOutUser, auth} = useContext(GlobalContext)

    /*--------------------------------------------------------------------------------*/
    /*To open SIDEBAR-MENU in MOBILE VIEW                                             */
    /*--------------------------------------------------------------------------------*/
    const showMobilemenu = () => {
        document.getElementById('main-wrapper').classList.toggle('show-sidebar');
    }

    return (
        <header className="topbar navbarbg" data-navbarbg="skin1">
            <Navbar className="top-navbar" dark expand="md">
                <div className="navbar-header" id="logobg" data-logobg="skin6">
                    
                    <NavbarBrand href="/">
                      <h1>LOGO</h1>
                    </NavbarBrand>
                   
                    {auth.isAuthenticated && <button className="btn btn-link nav-toggler d-block d-md-none" onClick={() => showMobilemenu()}>
                        <i className="fas fa-bars" />
                    </button> }
                </div>

                {auth.isAuthenticated && <Collapse className="navbarbg" navbar data-navbarbg="skin1" >
                    <Nav className="ml-auto float-right" navbar>
                        
                        
                        <UncontrolledDropdown nav inNavbar>
                            <DropdownToggle nav caret className="pro-pic">
                            <i class="fas fa-user-circle" id="useri"></i>


                            </DropdownToggle>
                            <DropdownMenu right className="user-dd">
                                <DropdownItem>
                                <NavLink className="nav-link" to="/showProfile" id="profileDiv">
                                     <span className="profilelink"><i class="fas fa-id-card mr-1 ml-1"></i><span>Profile</span></span>
                                    </NavLink>
                  </DropdownItem>
                                
                                {auth.isAuthenticated || <DropdownItem>
                                    
                                    <NavLink className="nav-link" to="/loggedin">
                                    
                                    <span className="ti-email hide-menu ">Login</span>
                                    </NavLink>
                                 
                  </DropdownItem>}
                                
                                <DropdownItem divider />
                                { auth && <DropdownItem  onClick={() => logOutUser()}>
                                    <i className="fa fa-power-off mr-1 ml-1"/> Logout
                  </DropdownItem>}
         
                            </DropdownMenu>
                        </UncontrolledDropdown>
                       
                    </Nav>
                </Collapse>}
            </Navbar>
        </header>
    );
}
export default Header;
