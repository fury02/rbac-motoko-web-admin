import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../redux/app/Hooks";
import {Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {CANISTER_RBAC, LOCAL_CANISTER_RBAC, NODE_ENV} from "../../settings";
import { IAuthenticationDataContext, selectAuthenticationDataContextValues } from "../../redux/features/authentication_data/AuthenticationDataSlice";
import {arrRRPConvertor} from "../../utility/utility";
import { IParticipantsContext, selectParticipantsContextValues } from "../../redux/features/participants/ParticipantsContextSlice";
import {useNavigate} from "react-router-dom";

// - Source code lib: https://github.com/fury02/rbac-motoko
// - Source code web administrator: https://github.com/fury02/rbac-motoko-web-admin
// - Example: web administrator (and web consumer) https://gyuwx-hqaaa-aaaan-qdw2a-cai.icp0.io/
// - Example: canister https://github.com/fury02/consumer-rbac
// - Documentation: https://fury02.github.io/doc-rbac-motoko/

export const HomeComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const principal = authentication_context.principal;

    const [canister_id, setCanisterId]
        = useState<string | undefined>(NODE_ENV.toString() == 'production' ? CANISTER_RBAC.toString() : LOCAL_CANISTER_RBAC.toString());
    const [caller, setCaller] = useState<string>('');

    const ButtonClick = async () =>{
        let actor =  authentication_context.actor_identity_context.ActorIdentity;
        let result = await actor?.whoami_caller();
        if(result){ setCaller(result); };
    }

    let canister_command = principal == undefined ?
        <></> :
        NODE_ENV.toString() == 'production' ?
            <div>
                <h4>Execute commands before starting using:</h4>
                <h6>1) Run command dfx</h6>
                <h6>dfx canister --network=ic update-settings rbac --add-controller {canister_id}</h6>
            </div> :
            <div>
                <h4>Execute commands before starting using:</h4>
                <h6>1) Run command dfx</h6>
                <h6>dfx canister update-settings rbac --add-controller {canister_id}</h6>
            </div>

    let principal_command = principal == undefined ?
        <></> :
        NODE_ENV.toString() == 'production' ?
            <div>
                <h6>2) Run command dfx</h6>
                <h6>dfx canister --network=ic call rbac add_admin "(principal \"{principal}\")"</h6>
            </div> :
            <div>
                <h6>2) Run command dfx</h6>
                <h6>dfx canister call rbac add_admin "(principal \"{principal}\")"</h6>
            </div>

    let initialization_command = principal == undefined ?
        <></> :
        NODE_ENV.toString() == 'production' ?
            <div>
                <h6>3) Run commands dfx:</h6>
                <h6>dfx canister --network=ic call rbac init</h6>
            </div> :
            <div>
                <h6>3) Run commands dfx:</h6>
                <h6>dfx canister call rbac init</h6>
            </div>

    let verifyinig_auth_actor_identity = principal == undefined ?
        <></> :
        <div>
            <div>
                <h4>Verifying an authenticated call:</h4>
                <Button onClick={() => ButtonClick()} className={"btn-secondary"}>Auth-Whoami</Button>
            </div>
        </div>

    let verifyinig_auth_token = principal == undefined ?
        <></> :
        <div>
            <div>
                <h4>Authentication token (slice):</h4>
                <div>
                    <text style={{ fontFamily: "inherit" }}>principal:</text>
                    <text style={{ fontFamily: "monospace" }}>{auth_client_stored?.token.payload.principal.toString()}</text>
                </div>
                <div>
                    <text style={{ fontFamily: "inherit" }}>jti:</text>
                    <text style={{ fontFamily: "monospace" }}>{auth_client_stored?.token.payload.jti}</text></div>
                <div>
                    <text style={{ fontFamily: "inherit" }}>exp:</text>
                    <text style={{ fontFamily: "monospace" }}>{auth_client_stored?.token.payload.exp.toString()}</text>
                </div>
                <div>
                    <text style={{ fontFamily: "inherit" }}>roles:</text>
                    <text style={{ fontFamily: "monospace" }}>{arrRRPConvertor(auth_client_stored?.token.payload.arp)}</text>
                </div>
                <div>
                    <text style={{ fontFamily: "inherit" }}>privileges:</text>
                    <text style={{ fontFamily: "monospace" }}>{
                        auth_client_stored == undefined ? '' : Object.keys(auth_client_stored?.participant)[0]
                    }</text>
                </div>
            </div>
        </div>

    let caller_auth = principal == undefined ?
        <></> :
        <div>
            <div>
                {caller}
            </div>
        </div>

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
                            <h4>
                                Role-Based Authentication Class
                            </h4>
                            <a href="https://forum.dfinity.org/t/open-icdevs-org-bounty-62-role-based-authentication-class-motoko-8-000/19452">
                                https://forum.dfinity.org/t/open-icdevs-org-bounty-62-role-based-authentication-class-motoko-8-000/19452
                            </a>
                            <h6>
                                @Safik
                            </h6>
                        </>
                    </Col>
                </Row>
                <Row className="start-100">
                    <Col className="start-100">
                        <>
                            <div>
                                <h6>
                                    {canister_command}
                                </h6>
                                <h6>
                                    {principal_command}
                                </h6>
                                <h6>
                                    {initialization_command}
                                </h6>
                            </div>
                        </>
                    </Col>
                    <Col>
                        <div>
                            <h6>
                                {verifyinig_auth_token}
                            </h6>
                            {/*<h6>*/}
                            {/*    {verifyinig_auth_actor_identity}*/}
                            {/*</h6>*/}
                        </div>
                    </Col>

                </Row>
                <Row>
                    <Col>
                        <>
                            <div>
                                <h4></h4>
                            </div>
                        </>
                    </Col>
                    <Col>
                        <>
                            <h6>
                                {caller_auth}
                            </h6>

                        </>
                    </Col>
                </Row>
            </Container>

        </div>
    );
}