import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {Principal} from "@dfinity/principal";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {useNavigate} from "react-router-dom";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";


const template_principal = "*****-*****-*****-*****-*****-*****-*****-*****-*****-*****-***";
const template_azat = "***********";

export const RbacCreateEntityComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const [admin, setAdmin] = useState<string>('');
    const [user, setUser] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [permission , setPermission ] = useState<string>('');

    const stored_admins = participants_context_stored.admins;
    const stored_principals = participants_context_stored.users;
    const stored_roles = participants_context_stored.roles;
    const stored_permissions = participants_context_stored.permissions;

    const AddAdmin = async () =>{
        if(auth_client_stored){
            if(actor){
                let response = await actor.add_admin(Principal.fromText(admin));
                if(Object.keys(response)[0] == "ok"){
                    var result = Object.values(response)[0];

                    var temp = Array<string>();
                    Object.assign(temp, stored_admins);
                    temp.push(admin);

                    const temp2  = [...stored_principals]; 
                    temp2.push(admin);
                    dispatch(set_participants_context_values({
                        admins: temp,
                        users: temp2,
                        roles: stored_roles,
                        permissions: stored_permissions,
                    }));

                    alert("Ok.");
                }
                else {
                    alert("Error add admin.");
                }
            }
        }
        else {
            alert("Authorization failed. Log back into the system!");
        }
    }

    const AddUser = async () =>{
        if(auth_client_stored){
            if(actor){
                let response = await actor.add_user(Principal.fromText(user), auth_client_stored);
                if(Object.keys(response)[0] == "ok"){
                    var result = Object.values(response)[0]; 

                    const temp  = [...stored_principals]; 
                    temp.push(user);
                    dispatch(set_participants_context_values({
                        admins: stored_admins,
                        users: temp,
                        roles: stored_roles,
                        permissions: stored_permissions,
                    }));

                    alert("Ok.");
                }
                else {
                    alert("Error add user.");
                }
            }
        }
        else {
            alert("Authorization failed. Log back into the system!");
        }
    }

    const AddRole = async () =>{
        if(auth_client_stored){
            if(actor){
                let response = await actor.add_role(role, auth_client_stored);
                if(Object.keys(response)[0] == "ok"){
                    var result = Object.values(response)[0];
                    var temp = Array<string>();
                    Object.assign(temp, stored_roles);
                    temp.push(role);
                    dispatch(set_participants_context_values({
                        admins: stored_admins,
                        users: stored_principals,
                        roles: temp,
                        permissions: stored_permissions,
                    }));
                    alert("Ok.");
                }
                else {
                    alert("Error add role.");
                }
            }
        }
        else {
            alert("Authorization failed. Log back into the system!");
        }
    }

    const AddPermission = async () =>{
        if(auth_client_stored){
            if(actor){
                let response = await actor.add_permission(permission, auth_client_stored);
                if(Object.keys(response)[0] == "ok"){
                    var result = Object.values(response)[0];
                    var temp = Array<string>();
                    Object.assign(temp, stored_permissions);
                    temp.push(permission);
                    dispatch(set_participants_context_values({
                        admins: stored_admins,
                        users: stored_principals,
                        roles: stored_roles,
                        permissions: temp,
                    }));
                    alert("Ok.");
                }
                else {
                    alert("Error add permission.");
                }
            }
        }
        else {
            alert("Authorization failed. Log back into the system!");
        }
    }

    const textAdminHandlerForm = (e: string) => { setAdmin(e); }
    const textUserHandlerForm = (e: string) => { setUser(e); }
    const textRoleHandlerForm = (e: string) => { setRole(e); }
    const textPermissionHandlerForm = (e: string) => { setPermission(e); }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh'
        }}>
        <Container>
            <Row className="p-5 border">
                <Col>
                    <>
                        <div>
                            <h4>
                                Adding participants and delineation descriptions to the RBAC class
                            </h4>
                        </div>
                        <InputGroup className="mb-4">
                            <Button variant="outline-primary" id="button-add-admin" size={"sm"} onClick={() => AddAdmin()}>
                                Add Admin
                            </Button>
                            <Form.Control
                                aria-label="Example text with button addon"
                                aria-describedby="basic-addon1"
                                defaultValue={template_principal}
                                onChange={(event) => {textAdminHandlerForm(event.target.value)}}
                            >
                            </Form.Control>
                        </InputGroup>

                        <InputGroup className="mb-4">
                            <Button variant="outline-primary" id="button-add-user" size={"sm"} onClick={() => AddUser()}>
                                Add User
                            </Button>
                            <Form.Control
                                aria-label=""
                                aria-describedby="basic-addon1"
                                defaultValue={template_principal}
                                onChange={(event) => {textUserHandlerForm(event.target.value)}}
                            />
                        </InputGroup>

                        <InputGroup className="mb-4">
                            <Button variant="outline-primary" id="button-add-role" size={"sm"} onClick={() => AddRole()}>
                                Add Role
                            </Button>
                            <Form.Control
                                aria-label=""
                                aria-describedby="basic-addon1"
                                defaultValue={template_azat}
                                onChange={(event) => {textRoleHandlerForm(event.target.value)}}
                            />
                        </InputGroup>

                        <InputGroup className="mb-4">
                            <Button variant="outline-primary" id="button-add-permision" size={"sm"} onClick={() => AddPermission()}>
                                Add Permission
                            </Button>
                            <Form.Control
                                aria-label=""
                                aria-describedby="basic-addon1"
                                defaultValue={template_azat}
                                onChange={(event) => {textPermissionHandlerForm(event.target.value)}}
                            />
                        </InputGroup>
                    </>
                </Col>
            </Row>
        </Container>
        </div>
    );
}