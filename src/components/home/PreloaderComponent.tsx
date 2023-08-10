import React, {useEffect, useState} from "react";
import {Button, Col, Container, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../redux/features/participants/ParticipantsContextSlice";
import {CANISTER_RBAC, LOCAL_CANISTER_RBAC, NODE_ENV} from "../../settings";
import {Principal} from "@dfinity/principal";
import {useNavigate} from "react-router-dom";
import {arrPrToStr} from "../../utility/utility";
export const PreloaderComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const stored_admins = participants_context_stored.admins;
    const stored_principals = participants_context_stored.users;
    const stored_roles = participants_context_stored.roles;
    const stored_permissions = participants_context_stored.permissions;

    const navigate = useNavigate();

    useEffect(() => {
        async function AsyncAction() {
            try {

                let _admins = Array<string>();
                let _principals = Array<string>();
                let _roles = Array<string>();
                let _permissions = Array<string>();

                // if (stored_admins?.length > 0) {
                //     _admins = stored_admins;
                // };
                // if (stored_principals?.length > 0) {
                //     _principals = stored_principals;
                // };
                // if (stored_roles?.length > 0) {
                //     _roles = stored_roles;
                // };
                // if (stored_permissions?.length > 0) {
                //     _permissions = stored_permissions;
                // };

                if (auth_client_stored) {
                    if (actor) {
                            if (_admins?.length == 0 || _admins == undefined) {
                                let saved_admins = await actor.admins();
                                if (Object.keys(saved_admins)[0] == "ok") {
                                    var result = Object.values(saved_admins)[0];
                                    result.unshift(Principal.anonymous());
                                    let result_str = arrPrToStr(result);
                                    _admins = result_str;
                                }
                            };
                            if (_principals?.length == 0 || _principals == undefined) {
                                let saved_principals = await actor.users(auth_client_stored);
                                if (Object.keys(saved_principals)[0] == "ok") {
                                    var result = Object.values(saved_principals)[0];
                                    result.unshift(Principal.anonymous());
                                    let result_str = arrPrToStr(result);
                                    _principals = result_str;
                                }
                            };
                            if (_roles?.length == 0 || _roles == undefined) {
                                let saved_roles = await actor.roles(auth_client_stored);
                                if (Object.keys(saved_roles)[0] == "ok") {
                                    var result = Object.values(saved_roles)[0];
                                    result.unshift("");
                                    _roles = result;
                                }
                            };
                            if (_permissions?.length == 0 || _permissions == undefined) {
                                let saved_permissions = await actor.permissions(auth_client_stored);
                                if (Object.keys(saved_permissions)[0] == "ok") {
                                    var result = Object.values(saved_permissions)[0];
                                    result.unshift("");
                                    _permissions = result;
                                }
                            };

                            dispatch(set_participants_context_values({
                                users: _principals,
                                admins: _admins,
                                roles: _roles,
                                permissions: _permissions,
                            }));
                            // home navigate
                            await GoNavigate();
                        }
                }
            }
            catch (e) {
                console.log(e);
                await GoNavigate();
            }
        }
        AsyncAction();
    }, [])

    const Preloader =
    <div
        className="center w-100 d-flex justify-content-center align-items-center">
        {/* bootstrap spinner */}
        <text style={{ fontFamily: "monospace", fontSize: 34 }}>Loading...     </text>
        <Spinner
            animation="grow" variant="light"
            role="status"
            style={{ width: "200px", height: "200px" }}
        >
        </Spinner>
        <span className="visually-hidden">Loading...</span>
    </div>

    const GoNavigate = async () => {
        // home navigate
        navigate("/");
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh'
        }}>
            {Preloader}
        </div>
    );
}