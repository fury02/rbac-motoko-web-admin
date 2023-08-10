import React, {useEffect, useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {Principal} from "@dfinity/principal";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext, selectParticipantsContextValues,
    set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";

export const RolePermissionsComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const [admins, setAdmins] = useState<Array<string>>([]);
    const [principals, setPrincipals] = useState<Array<string>>([]);
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
    const BindPermissions = async () => {
        if(selected_role != '' && selected_permission != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.bind_permission(selected_permission, selected_role, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        alert("Ok.");
                    }
                    else {
                        alert("Error bind permission for role.");
                    }
                }
            }
        }
        else {alert("Not selected permission or role.");}
    }

    const UnbindPermissions = async () => {
        if(selected_role != '' && selected_permission != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.unbind_permission(selected_permission, selected_role, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        alert("Ok.");
                    }
                    else {
                        alert("Error unbind permission for role.");
                    }
                }
            }
        }
        else { alert("Not selected permission or role."); }
    }

    let roles_permissions_jsx_element_bind = permissions.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Associate a role with permissions</h4>
            </div>
            <h6>Roles:</h6>
            <Form.Select className="mb-4" onChange={ p => {selectedRole(p.target.value)}}>
                {
                    roles?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <h6>Permissions:</h6>
            <Form.Select className="mb-4" onChange={ p => {selectedPermission(p.target.value)}}>
                {
                    permissions?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))
                }
            </Form.Select>
            <div className="container">
                <div className="row gx-5">
                    <div className="col">
                        <Button className="border"variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => BindPermissions()}>
                            Bind
                        </Button>
                    </div>
                    <div className="col">
                        <Button className="border" variant="outline-danger" id="button-update-role-permision" size={"sm"} onClick={() => UnbindPermissions()}>
                            Unbind
                        </Button>
                    </div>
                </div>
            </div>
        </>

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
                        {roles_permissions_jsx_element_bind}
                    </>
                </Col>
            </Row>
        </Container>
            </div>
    );
}
