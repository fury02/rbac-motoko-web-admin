import React, {useEffect, useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";
import {Principal} from "@dfinity/principal";
import {ArrayRelatedRP} from "../../declarations/rbac/rbac.did";
import {arrRRPConvertor} from "../../utility/utility";
export const RolesPermissionsComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const [roles_permissions , setRolesPermissions ] = useState<ArrayRelatedRP>([]);
    const [roles_permissions_format , setRolesPermissionsFormat ] = useState<string>('');

    useEffect(() => {
        async function AsyncAction() {
            try {
                if(auth_client_stored){
                    if(actor){
                        if(Object.keys(auth_client_stored.participant)[0] == "Admin"){
                            let response = await actor.roles_permissions(auth_client_stored);
                            if(Object.keys(response)[0] == "ok"){
                                var result = Object.values(response)[0];
                                setRolesPermissions(result);
                                setRolesPermissionsFormat(arrRRPConvertor(result));
                            }
                            else {
                                alert("Error get roles permissions.");
                            }
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

    let roles_permissions_jsx_element = roles_permissions.length == 0 ?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
                <span>Rbac...</span>
            </div>
        </> :
        <>
            <div>
                {roles_permissions_format}
            </div>
        </>

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            {roles_permissions_jsx_element}
        </div>

    );
}