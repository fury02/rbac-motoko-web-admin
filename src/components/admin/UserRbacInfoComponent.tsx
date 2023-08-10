import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {
    _SERVICE as service_auth_rbac,
    ArrayRelatedRP,
    List,
    ListRelatedRP,
    RelatedRP
} from "../../declarations/rbac/rbac.did";
import {Principal} from "@dfinity/principal";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";
import {arrPrToStr, arrRRPConvertor} from "../../utility/utility";
export const UserRbacInfoComponent: React.FC = () => {
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
    const [selected_admin , setSelectedAdmin ] = useState<string>('');
    const [users, setUsers] = useState<Array<string>>([]);
    const [selected_user, setSelectedUser ] = useState<string>('');
    const [admins, setAdmins] = useState<Array<string>>([]);
    const [principals, setPrincipals] = useState<Array<string>>([]);
    const [selected_principal , setSelectedPrincipal ] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [selected_role , setSelectedRole ] = useState<string>('');
    const [roles, setRoles] = useState<Array<string>>([]);
    const [user_roles, setUserRoles] = useState<Array<string>>([]);
    const [user_roles_str, setUserRolesStr] = useState<string>('');
    const [permission , setPermission ] = useState<string>('');
    const [selected_permission , setSelectedPermission ] = useState<string>('');
    const [permissions , setPermissions ] = useState<Array<string>>([]);

    const [user_permissions , setUserPermissions ] = useState<Array<string>>([]);

    const [user_roles_permission_format , setUserRolesPermissionFormat ] = useState<string>('');
    const [user_roles_permission, setUserRolesPermission] = useState<ArrayRelatedRP | undefined>([]);

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

    let principals_jsx_element = principals.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                <h4>User rbac information</h4>
            </div>
            <h6>Users:</h6>
            <Form.Select className="mb-4" onChange={ u => {selectedPrincipals(u.target.value)}}>
                {
                    principals?.map((i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))

                }
            </Form.Select>

        </>

    let user_roles_permissions_jsx_element = user_roles_permission_format == '' ?
        <>
            {/*<div className="spinner-border text-secondary my-xxl-5" role="status">*/}
            {/*    <span>Load...</span>*/}
            {/*</div>*/}
        </> :
        <>
            <h6 className="mall">Roles - permissions:</h6>
            <h6 className="text-muted fst-italic small">
                {user_roles_permission_format}
            </h6>
        </>

    const selectedPrincipals = async (user: any) => {
        setSelectedPrincipal(user);
        setUserRolesPermission(undefined);
        setUserRolesPermissionFormat('');
        if(auth_client_stored){
            if(actor){
                let response = await actor.user_roles(Principal.fromText(user),  auth_client_stored);
                if(Object.keys(response)[0] == "ok"){
                    var result = Object.values(response)[0];
                    setUserRolesPermission(result);
                    let s = arrRRPConvertor(result);
                    setUserRolesPermissionFormat(s);
                }
                else {
                    alert("Error unbind role for user.");
                }
            }
        }
    }

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
                        {user_roles_permissions_jsx_element}
                    </>
                </Col>
            </Row>
        </Container>
        </div>
    );
}