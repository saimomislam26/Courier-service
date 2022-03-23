import React, { useState, useEffect, useContext } from 'react';
import { Switch } from 'react-router-dom';
import Header from './layout-components/header/header.jsx';
import Sidebar from './layout-components/sidebar/sidebar.jsx';
import Footer from './layout-components/footer/footer.jsx';
import ThemeRoutes from '../routes/routing.jsx';
import Starter from '../views/starter/starter.jsx';
import Notification from '../views/ui-components/Notification.jsx';
import { GlobalContext } from '../context/ProjectContext.js';

import { 
    AdminPrivateRoute, SubAdminPrivateRoute,
     PrivateRoute, LoginPrivateRoute } from '../routes/auth-route/index.js';
import Updateprofile from '../authentication/Updateprofile.js';
import Alerts from '../views/ui-components/branch_history.jsx';
import Badges from '../views/ui-components/badge.jsx';
import Buttons from '../views/ui-components/employee_list.jsx';
import LayoutComponent from '../views/ui-components/create_user.jsx';
import UpdateUser from '../views/ui-components/update_user.jsx';
import PaginationComponent from '../views/ui-components/create_parcel.jsx';
import ProductDetails from '../views/ui-components/product_details.jsx';
import TooltipComponent from '../views/ui-components/tooltip.jsx';
import BranchList from '../views/ui-components/branch_list.jsx';
import UpdateProduct from '../views/ui-components/update_product.jsx';
import { Feeds } from '../components/dashboard/index.js';
import BeatLoader from 'react-spinners/BeatLoader'
import Archive from '../views/ui-components/archive.jsx';



const Fulllayout = (props) => {
    /*--------------------------------------------------------------------------------*/
    /*Change the layout settings [HEADER,SIDEBAR && DARK LAYOUT] from here            */
    /*--------------------------------------------------------------------------------*/
    const [width, setWidth] = useState(window.innerWidth);
    const {auth} = useContext(GlobalContext)

    // props.history.listen((location, action) => {
    //     if (
    //         window.innerWidth < 767 &&
    //         document
    //             .getElementById('main-wrapper')
    //             .className.indexOf('show-sidebar') !== -1
    //     ) {
    //         document
    //             .getElementById('main-wrapper')
    //             .classList.toggle('show-sidebar');
    //     }
    // });
  
    /*--------------------------------------------------------------------------------*/
    /*Function that handles sidebar, changes when resizing App                        */
    /*--------------------------------------------------------------------------------*/
    useEffect(() => {
        const updateDimensions = () => {
            let element = document.getElementById('main-wrapper');
            setWidth(window.innerWidth)
             
            if (width < 1170) {
                element && element.setAttribute("data-sidebartype", "mini-sidebar");
                element && element.classList.add("mini-sidebar");
            } else {
                element && element.setAttribute("data-sidebartype", "full");
                element && element.classList.remove("mini-sidebar");
            }
        }
        if (document.readyState === "complete") {
            updateDimensions();
        }
        window.addEventListener("resize", updateDimensions.bind(this));
        window.addEventListener("load", updateDimensions.bind(this));
        return () => {
            window.removeEventListener("load", updateDimensions.bind(this));
            window.removeEventListener("resize", updateDimensions.bind(this));
        };
    }, [width]);


    /*--------------------------------------------------------------------------------*/
    /* Theme Setting && Layout Options wiil be Change From Here                       */
    /*--------------------------------------------------------------------------------*/
    return (<>
        { auth.isLoading ?  <div className="show-pic"><BeatLoader color={"#0178bc"} loading={true} size={50} /></div>
        : <div
            id="main-wrapper"
            data-theme="light"
            data-layout="vertical"
            data-sidebartype="full"
            data-sidebar-position="fixed"
            data-header-position="fixed"
            data-boxed-layout="full"
        >
            {/*--------------------------------------------------------------------------------*/}
            {/* Header                                                                         */}
            {/*--------------------------------------------------------------------------------*/}
            { auth.isAuthenticated && <Header />}
            {/*--------------------------------------------------------------------------------*/}
            {/* Sidebar                                                                        */}
            {/*--------------------------------------------------------------------------------*/}
           { auth.isAuthenticated && <Sidebar {...props} routes={ThemeRoutes} />}
            {/*--------------------------------------------------------------------------------*/}
            {/* Page Main-Content                                                              */}
            {/*--------------------------------------------------------------------------------*/}
            <div className="page-wrapper d-block">
                <div className="page-content container-fluid">
                   
                    <Notification/>
                    <Switch>
                        <PrivateRoute exact path="/(|dashboard)" component={Starter}/>
                        {/* <Route exact path="/loggedin" component={Login}/> */}
                        {/* <LoginPrivateRoute exact path="/(login|loggedin)" component={Login}/> */}
                        <PrivateRoute exact path="/showProfile" component={Updateprofile}/>
                        <AdminPrivateRoute exact path="/feeds" component={Feeds}/>
                        <AdminPrivateRoute exact path="/parcel-history" component={Alerts}/>
                       
                        <AdminPrivateRoute exact path="/employees" component={Buttons}/>
                        <AdminPrivateRoute exact path="/branch" component={BranchList}/>
                        <AdminPrivateRoute exact path="/create-employee" component={LayoutComponent}/>
                        <AdminPrivateRoute exact path="/update-employee/:uid" component={UpdateUser}/>
                        <PrivateRoute exact path="/create-percel" component={PaginationComponent}/>
                        <PrivateRoute exact path="/update-percel/:pid" component={UpdateProduct}/>
                        <PrivateRoute exact path="/product-details/:uid" component={ProductDetails}/>
                        <AdminPrivateRoute exact path="/archive" component={Archive}/>
                        {/* <Route exact path="/track-parcel" component={ParcelTrack}/> */}
                       
                    </Switch>
                </div>
                {auth.isAuthenticated && <Footer />}
            </div>
        </div>}</>
    );
}
export default Fulllayout;
