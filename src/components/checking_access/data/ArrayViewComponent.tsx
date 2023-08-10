import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../redux/app/Hooks";

import {Actor, HttpAgent} from "@dfinity/agent";
import {_SERVICE as service_auth_rbac} from "../../../declarations/rbac/rbac.did";
import {idlFactory as idl_auth_rbac} from "../../../declarations/rbac/index";
import {Principal} from "@dfinity/principal";
import {Col, Container, Row} from "react-bootstrap";
import {CANISTER_RBAC, host_boundary, LOCAL_CANISTER_RBAC, NODE_ENV} from "../../../settings";
import {
    IAuthenticationDataContext,
    selectAuthenticationDataContextValues
} from "../../../redux/features/authentication_data/AuthenticationDataSlice";
import {
    IParticipantsContext,
    selectParticipantsContextValues, set_participants_context_values
} from "../../../redux/features/participants/ParticipantsContextSlice";
import {AuthClient} from "@dfinity/auth-client";
import {arrToStr} from "../../../utility/utility";

export const ArrayViewComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    const participants_context_stored: IParticipantsContext = useAppSelector(selectParticipantsContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const actor = authentication_context.actor_identity_context.ActorIdentity;

    const [array_backend_full_ckeck, setArrayFullCheck] = useState<bigint[]>([]);
    const [array_backend_auth_client_ckeck, setArrayAuthClientCheck] = useState<bigint[]>([]);
    const [array_web_token_ckeck, setArrayWebCheck] = useState<bigint[]>([]);

    //sample
    const role_array_read = 'array_read';
    const permissions_read = "read";

    useEffect(() => {
        async function AsyncAction() {
            try {

                if(auth_client_stored){
                    //1 full ckeck in backend
                    if(actor){
                        // if(Object.keys(auth_client_stored.participant)[0] == "Admin"){ }
                        // else if(Object.keys(auth_client_stored.participant)[0] == "User"){ }
                        let array_full_ckeck_backend = await actor.read_array(auth_client_stored);
                        setArrayFullCheck(array_full_ckeck_backend);
                    }
                    //2 ckeck auth-client in backend
                    let anonymous_actor = await getAnonymousActor();
                    let array_ckeck_auth_client_backend = await anonymous_actor.anonymous_read_array(auth_client_stored);
                    setArrayAuthClientCheck(array_ckeck_auth_client_backend);
                    //3 ckeck in web auth-client
                    let arrp = auth_client_stored.token.payload.arp;
                    if(arrp?.length != 0){
                        arrp?.forEach(rp => {
                            if(role_array_read === rp.role){
                                anonymous_actor.indisputable_read_array().then(i =>{
                                    setArrayWebCheck(i);
                                });
                            }
                        })
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        AsyncAction();
    }, [])

    let print_array_vfc =  array_backend_full_ckeck.length == 0?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
            </div>
        </> :
        <>
            <h4 className="small">#1</h4>
            <h6 className="small">Full verification includes:</h6>
            <h6 className="small">-сhecking the caller on the server and the token for their identity</h6>
            <h6 className="small">-verification of the stored token for the caller and the issued roles in compliance</h6>
            <h6 className="text-muted fst-italic small">
                {arrToStr(array_backend_full_ckeck)}
            </h6>
        </>

    let print_array_acc = array_backend_auth_client_ckeck .length == 0?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
            </div>
        </> :
        <>
            <h4 className="small">#2</h4>
            <h6 className="small">Verification includes:</h6>
            <h6 className="small">-verification of the stored token for the caller and the issued roles in compliance</h6>
            <h6 className="text-muted fst-italic small">
                {arrToStr(array_backend_auth_client_ckeck)}
            </h6>
        </>
    let print_array_wc =  array_web_token_ckeck.length == 0?
        <>
            <div className="spinner-border text-secondary my-xxl-5" role="status">
            </div>
        </> :
        <>
            <h4 className="small">#3</h4>
            <h6 className="small">Checking in the WEB application for compliance with the assigned roles</h6>
            <h6 className="text-muted fst-italic small">
                {arrToStr(array_web_token_ckeck)}
            </h6>
        </>

    //**Anonymous actor
    async function getAnonymousActor(){
        let canister_id = NODE_ENV.toString() == 'production' ? CANISTER_RBAC.toString() : LOCAL_CANISTER_RBAC.toString();
        const agent = await getAnonymousAgent();
        const actor_service
            = Actor.createActor<service_auth_rbac>(idl_auth_rbac, { agent, canisterId: canister_id})
        return actor_service
    }
    async function getAnonymousAgent(){
        const host = host_boundary;
        const auth_client = await AuthClient.create();
        const identity = await auth_client.getIdentity();
        const agent = new HttpAgent({identity, host});
        return agent;
    }
    //**Anonymous actor

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
        }}>
            <Container>
                <Row>
                    <Col>
                        <>
                            {print_array_vfc}
                            {print_array_acc}
                            {print_array_wc}
                        </>
                    </Col>
                </Row>
            </Container>
        </div>

    );
}