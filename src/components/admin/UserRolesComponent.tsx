import React, {useEffect, useState} from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
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
import {arrPrToStr} from "../../utility/utility";

export const UserRolesComponent: React.FC = () => {
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
    const [selected_principal , setSelectedPrincipal ] = useState<string>('');
    const [selected_role , setSelectedRole ] = useState<string>('');
    const [roles, setRoles] = useState<Array<string>>([]);
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
                            if(_principals?.length == 0 || _principals == undefined){
                                let saved_principals = await actor.users(auth_client_stored);
                                if(Object.keys(saved_principals)[0] == "ok"){
                                    var result = Object.values(saved_principals)[0];
                                    result.unshift(Principal.anonymous());
                                    let result_str = arrPrToStr(result);
                                    setPrincipals(result_str);
                                    _principals  = result_str;
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


    let principals_roles_jsx_element_bind = principals.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>Associate a user with roles</h4>
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
            <div className="container">
                <div className="row gx-5">
                    <div className="col">
                        <Button className="border" variant="outline-primary" id="button-update-role-permision" size={"sm"} onClick={() => BindRole()}>
                            Bind
                        </Button>
                    </div>
                    <div className="col">
                        <Button className="border" variant="outline-danger" id="button-update-role-permision" size={"sm"} onClick={() => UnbindRole()}>
                            Unbind
                        </Button>
                    </div>
                </div>
            </div>
        </>

    const BindRole = async () => {
        if(selected_role != '' && selected_principal != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.bind_role(Principal.fromText(selected_principal), selected_role, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        alert("Ok.");
                    }
                    else {
                        alert("Error bind role for user.");
                    }
                }
            }
        }
        else {
            alert("Not selected user or role.");
        }
    }

    const UnbindRole = async () => {
        if(selected_role != '' && selected_principal != ''){
            if(auth_client_stored){
                if(actor){
                    let response = await actor.unbind_role(Principal.fromText(selected_principal), selected_role, auth_client_stored);
                    if(Object.keys(response)[0] == "ok"){
                        var result = Object.values(response)[0];
                        alert("Ok.");
                    }
                    else {
                        alert("Error unbind role for user.");
                    }
                }
            }
        }
        else {
            alert("Not selected user or role.");
        }
    }

    const selectedPrincipals = (u: any) => { setSelectedPrincipal(u); }
    const selectedRole = (r: any) => { setSelectedRole(r); }

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
                            {principals_roles_jsx_element_bind}
                        </>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}