import Starter from '../views/starter/starter.jsx';
// ui components
import BranchHistory from '../views/ui-components/branch_history.jsx';
import EmployeeList from '../views/ui-components/employee_list.jsx';
import CreateUser from '../views/ui-components/create_user.jsx';
import CreateParcel from '../views/ui-components/create_parcel.jsx';
import BranchList from '../views/ui-components/branch_list.jsx';
import { Feeds } from '../components/dashboard/index.js';
import Archive from '../views/ui-components/archive.jsx';



var ThemeRoutes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: 'mdi mdi-view-dashboard',
        permission: null,
        component: Starter
    },

    {
        path: '/parcel-history',
        name: 'Parcel History',
        icon: 'mdi mdi-sitemap',
        permission: '2',
        component: BranchHistory
    },
    {
        path: '/feeds',
        name: 'Feeds',
        icon: 'mdi mdi-history',
        permission: '2',
        component: Feeds
    },
    {
        path: '/employees',
        name: 'Branch Employee',
        icon: 'mdi mdi-account-multiple-outline',
        permission: "2",
        component: EmployeeList
    },
    {
        path: '/branch',
        name: 'All Branch',
        icon: 'mdi mdi-home-map-marker',
        permission: "1",
        component: BranchList
    },
    {
        path: '/create-employee',
        name: 'Create',
        icon: 'mdi mdi-account-key',
        permission: "2",
        component: CreateUser
    },
    {
        path: '/create-percel',
        name: 'Parcel Create',
        icon: 'mdi mdi-note-plus-outline',
        permission: "4",
        component: CreateParcel
    },
    {
        path: '/archive',
        name: 'Archive',
        icon: 'mdi mdi-note-plus-outline',
        permission: "2",
        component: Archive
    },
    // {
    //     path: '/updateProfile',
    //     name: 'Profile',
    //     icon: 'fas fa-id-card mr-1 ml-1',
    //     id: "manual",
    //     permission: null,
    //     component: Updateprofile
    // },
    // {
    //     path: '/create-percel',
    //     name: 'Logout',
    //     icon: 'fa fa-power-off mr-1 ml-1',
    //     permission: null,
    //     component: Login
    // },
    // {
    //     path: '/product-details/:uid',
    //     name: 'Parcel Details',
    //     icon: 'mdi mdi-pencil-circle',
    //     permission: "4",
    //     component: ProductDetails
    // },

    // { path: '/', pathTo: '/dashboard', name: 'Dashboard', redirect: true }
];
export default ThemeRoutes;

// permission level 1 = "only for Super Admin"
// permission level 2 = "only for super admin and subadmin"
// permission level 3 = "only for subadmin"
// permission level 4 = "only for booking department"
// permission level 5 = "only for delivery department"
// permission level null = "for all"