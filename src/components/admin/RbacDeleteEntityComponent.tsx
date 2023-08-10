import React, {useEffect, useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {Principal} from "@dfinity/principal";


import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";
import {arrPrToStr} from "../../utility/utility";

export const RbacDeleteEntityComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const [selected_admin , setSelectedAdmin ] = useState<string>('');
    const [admins, setAdmins] = useState<Array<string>>([]);
    const [principals, setPrincipals] = useState<Array<string>>([]);
    const [selected_principal , setSelectedPrincipal ] = useState<string>('');
    const [selected_role , setSelectedRole ] = useState<string>('');
    const [roles, setRoles] = useState<Array<string>>([]);
    const [selected_permission , setSelectedPermission ] = useState<string>('');
    const [permissions , setPermissions ] = useState<Array<string>>([]);

    const stored_admins = participants_context_stored.admins;
    const stored_principals = participants_context_stored.users;
    const stored_roles = participants_context_stored.roles;
    const stored_permissions = participants_context_stored.permissions;

    useEffect(() => {
        async function AsyncAction() {
            try {

                let _admins = Array<string>();
                let _principals = Array<string>();
                let _roles = Array<string>();
                let _permissions = Array<string>();

                if(stored_admins?.length > 0){
                    _admins = stored_admins;
                    setAdmins(stored_admins);};
                if(stored_principals?.length > 0){
                    _principals = stored_principals;
                    setPrincipals(stored_principals);};
                if(stored_roles?.length  > 0){
                    _roles = stored_roles;
                    setRoles(stored_roles);  };
                if(stored_permissions?.length > 0){
                    _permissions = stored_permissions;
                    setPermissions(stored_permissions)};

                if(auth_client_stored){
                    if(actor){
                        if(Object.keys(auth_client_stored.participant)[0] == "Admin"){
                            if(_admins?.length == 0 || _admins == undefined){
                                let saved_admins = await actor.admins();
                                if(Object.keys(saved_admins)[0] == "ok"){
                                    var result = Object.values(saved_admins)[0];
                                    result.unshift(Principal.anonymous());
                                    let result_str = arrPrToStr(result);
                                    setAdmins(result_str);
                                    _admins = result_str;
                                }
                            };
                            if(_principals?.length == 0 || _principals == undefined){
                                let saved_principals = await actor.users(auth_client_stored);
                                if(Object.keys(saved_principals)[0] == "ok"){
                                    var result = Object.values(saved_principals)[0];
                                    result.unshift(Principal.anonymous());
                                    let result_str = arrPrToStr(result);
                                    setPrincipals(result_str);
                                    _principals = result_str;
                                }
                            };
                            if(_roles?.length  == 0 || _roles == undefined){
                                let saved_roles = await actor.roles(auth_client_stored);
                                if(Object.keys(saved_roles)[0] == "ok"){
                                    var result = Object.values(saved_roles)[0];
                                    result.unshift("");
                                    setRoles(result);
                                    _roles = result;
                                }
                            };
                            if(_permissions?.length == 0 || _permissions == undefined){
                                let saved_permissions = await actor.permissions(auth_client_stored);
                                if(Object.keys(saved_permissions)[0] == "ok"){
                                    var result = Object.values(saved_permissions)[0];
                                    result.unshift("");
                                    setPermissions(result);
                                    _permissions = result;
                                }
                            };

                            dispatch(set_participants_context_values({
                                users: _principals,
                                admins: _admins,
                                roles: _roles,
                                permissions: _permissions,
                            }));
                        }
                    }
                }
                else {
                    alert("Authorization failed. Log back into the system!");
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        AsyncAction();
    }, [])

    const DeleteAdmin = async () =>{
        if(selected_admin != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.delete_admin(Principal.fromText(selected_admin));
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];

                        let temp = Object.assign([], stored_admins);
                        let temp_filter = temp.filter(i => {return i != selected_admin});
                        setAdmins(temp_filter);

                        let temp2 = Object.assign([], stored_principals);
                        let temp_filter2 = temp2.filter(i => {return i != selected_admin});
                        setPrincipals(temp_filter2);

                        dispatch(set_participants_context_values({
                            admins: temp_filter,
                            user: temp_filter2,
                            roles: stored_roles,
                            permissions: stored_permissions,
                        }));

                        alert("Ok.");
                    }
                    else {
                        alert("Error delete admin.");
                    }
                }
            }
        }
    }

    const DeleteUser = async () =>{
        if(selected_principal != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.delete_user(Principal.fromText(selected_principal), auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        let temp = Object.assign([], stored_principals);
                        let temp_filter = temp.filter(i => {return i != selected_principal});
                        setPrincipals(temp_filter);
                        dispatch(set_participants_context_values({
                            admins: stored_admins,
                            user: temp_filter,
                            roles: stored_roles,
                            permissions: stored_permissions,
                        }));
                        alert("Ok.");
                    }
                    else {
                        alert("Error delete user.");
                    }
                }
            }
        }
    }
    const DeleteRole = async () =>{
        if(selected_role != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.delete_role(selected_role, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        let temp = Object.assign([], stored_roles);
                        let temp_filter = temp.filter(i => {return i != selected_role});
                        setRoles(temp.filter(i => {return i != selected_role}));
                        dispatch(set_participants_context_values({
                            admins: stored_admins,
                            user: stored_principals,
                            roles:  temp_filter,
                            permissions: stored_permissions,
                        }));
                        alert("Ok.");
                    }
                    else {
                        alert("Error delete role.");
                    }
                }
            }
        }
    }
    const DeletePermission = async () =>{
        if(selected_permission != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.delete_permission(selected_permission, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        let temp = Object.assign([], stored_permissions);
                        let temp_filter = temp.filter(i => {return i != selected_permission});
                        setPermissions(temp_filter);
                        dispatch(set_participants_context_values({
                            admins: stored_admins,
                            user: stored_principals,
                            roles: stored_roles,
                            permissions: temp_filter,
                        }));
                        alert("Ok.");
                    }
                    else {
                        alert("Error delete permission.");
                    }
                }
            }
        }
    }

    let admins_jsx_element = admins.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Delete admins</h4>
            </div>
            <h6>Admins:</h6>
            <Form.Select className="mb-4" onChange={ a => {selectedAdmin(a.target.value)}}>
                {
                    admins?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <Button variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => DeleteAdmin()}>
                Delete
            </Button>
        </>


    let principals_jsx_element = principals.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Delete user</h4>
            </div>
            <h6>Users(principals):</h6>
            <Form.Select className="mb-4" onChange={ u => {selectedPrincipals(u.target.value)}}>
                {
                    principals?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <Button variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => DeleteUser()}>
                Delete
            </Button>
        </>

    let roles_jsx_element = roles.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Delete role</h4>
            </div>
            <h6>Roles:</h6>
            <Form.Select disabled={false} className="mb-4" onChange={ p => {selectedRole(p.target.value)}}>
                {
                    roles?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <Button variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => DeleteRole()}>
                Delete
            </Button>
        </>

    let permissions_jsx_element = permissions.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Delete permissions</h4>
            </div>
            <h6>Permissions:</h6>
            <Form.Select disabled={false} className="mb-4" onChange={ p => {selectedPermission(p.target.value)}}>
                {
                    permissions?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <Button variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => DeletePermission()}>
                Delete
            </Button>
        </>

    const selectedAdmin = (a: any) => { setSelectedAdmin(a); }
    const selectedPrincipals = (u: any) => { setSelectedPrincipal(u); }
    const selectedRole = (r: any) => { setSelectedRole(r); }
    const selectedPermission = (p: any) => { setSelectedPermission(p); }


    return (
        <div style={{
        display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
         }}>
            <Container>
                <Row className="p-5">
                    <Col>
                        <>
                            {principals_jsx_element}
                        </>
                    </Col>
                    <Col>
                        <>
                            {permissions_jsx_element}
                        </>
                    </Col>
                    <Col>
                        <>
                            {roles_jsx_element}
                        </>
                    </Col>
                    <Col >
                        <>
                            {admins_jsx_element}
                        </>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}