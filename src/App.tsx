import React, {useState} from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {HomeComponent} from "./components/home/HomeComponent";
import NavBarComponent from "./layouts/NavBarComponent";
import {RbacCreateEntityComponent} from "./components/admin/RbacCreateEntityComponent";
import {RolePermissionsComponent} from "./components/admin/RolePermissionsComponent";
import {UserRolesComponent} from "./components/admin/UserRolesComponent";
import {RbacDeleteEntityComponent} from "./components/admin/RbacDeleteEntityComponent";
import {UserRbacInfoComponent} from "./components/admin/UserRbacInfoComponent";
import {ArrayViewComponent} from "./components/checking_access/data/ArrayViewComponent";
import {PreloaderComponent} from "./components/home/PreloaderComponent";
import {RolesPermissionsComponent} from "./components/admin/RolesPermissionsComponent";

function App() {

  return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<NavBarComponent></NavBarComponent>}>
              <Route index element={<HomeComponent/>}></Route>
              {/*  /!*<Route path='doc' element={<DocumentationComponent/>}></Route>*!/*/}
              <Route path='checking_access/data/check'element={<ArrayViewComponent/>}></Route>
              <Route path='admin/create'element={<RbacCreateEntityComponent/>}></Route>
              <Route path='admin/bind/role_permissions'element={<RolePermissionsComponent/>}></Route>
              <Route path='admin/bind/user_roles'element={<UserRolesComponent/>}></Route>
              <Route path='admin/delete'element={<RbacDeleteEntityComponent/>}></Route>
              <Route path='admin/user_rbac_info'element={<UserRbacInfoComponent/>}></Route>
              <Route path='admin/roles_permissions'element={<RolesPermissionsComponent/>}></Route>
              <Route path='preloader'element={<PreloaderComponent/>}></Route>
              <Route path='*' element={<Navigate replace to="/"/>}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
