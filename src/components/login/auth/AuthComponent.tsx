import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Actor, ActorSubclass, HttpAgent, HttpAgentOptions, Identity, SignIdentity } from "@dfinity/agent";
// @ts-ignore
import { StoicIdentity as StoicIdentityImport } from 'ic-stoic-identity';
import { useAppDispatch, useAppSelector } from "../../../redux/app/Hooks";
import CSS from "csstype";
import { Navigate, useNavigate } from "react-router-dom";

import {
    CANISTER_FRONTEND,
    CANISTER_RBAC,
    IC_URL,
    LOCAL_CANISTER_RBAC,
    LOCAL_URL,
    NODE_ENV,
    PLUG,
    LOCAL_REPLICA_PORT, II
} from "../../../settings";

import { _SERVICE as service_auth_rbac, Errors, AuthClient as rbacAuthClient, Token } from "../../../declarations/rbac/rbac.did";
import { createActor, idlFactory as idl_auth_rbac } from "../../../declarations/rbac";
import { ECDSAKeyIdentity, WebAuthnIdentity } from "@dfinity/identity";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { _SERVICE } from "ic-mops/declarations/main/main.did";
import {
    authProvider, IActorIdentity,
    IAuthenticationDataContext, IHttpAgentIdentity,
    selectAuthenticationDataContextValues, set_authentication_data_context_values
} from "../../../redux/features/authentication_data/AuthenticationDataSlice";


interface ActorSubclassCreate {
    actor: ActorSubclass<service_auth_rbac>;
    create: boolean;
}

const ButtonStyles: CSS.Properties = {
    backgroundColor: 'beige',
    color: 'black',
    right: 0,
    fontFamily: "serif",
    width: '80px',
};

const ConnectButtonStyles: CSS.Properties = {
    backgroundColor: 'palegreen',
    color: 'black',
    right: 0,
    fontFamily: "serif",
    width: '80px',
};

//**Stoic**//
export type StoicIdentityStaticTypes = {
    disconnect(): Promise<void>;
};
//**Stoic**//
export const StoicIdentity: StoicIdentity & StoicIdentityStaticTypes = StoicIdentityImport;
//**Stoic**//
export interface StoicIdentity extends SignIdentity {
    connect(): Promise<StoicIdentity>;
    load(host?: string): Promise<StoicIdentity | undefined>;
}
//**Stoic**//
function createStoicHttpAgentLocal(identity: StoicIdentity): HttpAgent | undefined {
    const host = LOCAL_URL;
    try {
        const agentOptions: HttpAgentOptions = {
            host: host,
            identity: identity,
        };
        const agent = new HttpAgent(agentOptions);
        agent.fetchRootKey();//Local
        return agent;
    }
    catch (error) {
        console.log(error);
        alert(error);
        return undefined;
    }
}
//**Stoic**//
function createStoicHttpAgent(identity: StoicIdentity): HttpAgent | undefined {
    try {
        const host = IC_URL;
        const agentOptions: HttpAgentOptions = {
            host: host,
            identity: identity,
        };
        const agent = new HttpAgent(agentOptions);
        return agent;
    }
    catch (error) {
        console.log(error);
        alert(error);
        return undefined;
    }

}
//**Plug**//
async function createPlugActorLocal(): Promise<ActorSubclassCreate> {
    let canister_id = LOCAL_CANISTER_RBAC.toString();
    const host = LOCAL_URL;
    let list = [canister_id];
    try {
        const connect = await (window as any)?.ic?.plug?.requestConnect({ whitelist: list, host: host });//error parse???
        await (window as any)?.ic?.plug?.createAgent({ whitelist: list, host: host });//error parse??? local???
        await (window as any)?.ic?.plug?.agent.getPrincipal();
        let root_key = await (window as any)?.ic?.plug?.agent.fetchRootKey();//Local
        const plug_actor = await (window as any)?.ic?.plug?.createActor({
            canisterId: canister_id,
            interfaceFactory: idl_auth_rbac
        });
        return { actor: plug_actor, create: true };
    }
    catch (error) {
        console.log(error);
        alert(error);
        let options = {};
        const agentOptions = { ...options, host: host };
        const agent = new HttpAgent(agentOptions);
        agent.fetchRootKey();//Local
        const actor_empty = Actor.createActor<service_auth_rbac>(idl_auth_rbac, {
            agent,
            canisterId: canister_id
        });
        return { actor: actor_empty, create: false };
    }
}
//**Plug**//
async function createPlugActor(): Promise<ActorSubclassCreate> {
    let canister_id = CANISTER_RBAC.toString();
    let canister_frontend = CANISTER_FRONTEND.toString();
    const host = IC_URL;
    // let list = [canister_id, canister_frontend];
    let list = [canister_id];
    try {
        const connect = await (window as any)?.ic?.plug?.requestConnect({ whitelist: list, host: host });//error parse???
        await (window as any)?.ic?.plug?.createAgent({ whitelist: list, host: host });//error parse??? local???
        await (window as any)?.ic?.plug?.agent.getPrincipal();
        const plug_actor = await (window as any)?.ic?.plug?.createActor({
            canisterId: canister_id,
            interfaceFactory: idl_auth_rbac
        });
        return { actor: plug_actor, create: true };
    }
    catch (error) {
        console.log(error);
        alert(error);
        let options = {};
        const agentOptions = { ...options, host: host };
        const agent = new HttpAgent(agentOptions);
        const actor_empty = Actor.createActor<service_auth_rbac>(idl_auth_rbac, {
            agent,
            canisterId: canister_id
        });
        return { actor: actor_empty, create: false };
    }
};
//**II**//
const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

export const AuthComponent: React.FC = () => {
    //Redux dispatch
    const dispatch = useAppDispatch();
    //Redux connect context
    const authentication_context: IAuthenticationDataContext = useAppSelector(selectAuthenticationDataContextValues);
    //Redux - store get values
    const auth_client_stored = authentication_context.auth_client;
    const provider = authentication_context.provider;

    const navigate = useNavigate();

    const [stylePlug, setStylePlug] = useState<CSS.Properties>(ButtonStyles);
    const [styleStoic, setStyleStoic] = useState<CSS.Properties>(ButtonStyles);
    const [styleII, setStyleII] = useState<CSS.Properties>(ButtonStyles);
    //**Stoic**//
    const ButtonClickStoic = async () => {
        //**
        //You can bypass Redux
        //and use Stoic Storage
        //but this limits the integration of other providers
        //const stoicIdentity = await StoicIdentity.load();
        // **//
        //disconnect
        if (auth_client_stored) {
            await DisconnectStoic();
            await DisconnectPlug();
            await DisconnectII();
        }
        //connect
        else {
            await DisconnectStoic();
            await DisconnectPlug();
            await DisconnectII();
            if(provider === authProvider.II || provider === authProvider.Plug || provider === authProvider.Undefined){
                await ConnectStoic();
            }
        }
    }
    //**Plug**//
    const ButtonClickPlug = async () => {
        if (auth_client_stored) {
            await DisconnectStoic();
            await DisconnectPlug();
            await DisconnectII();
            if(provider === authProvider.II || provider === authProvider.Stoic || provider === authProvider.Undefined){
                await ConnectPlug();
            }
        }
        //connect
        else {
            await DisconnectStoic();
            await DisconnectPlug();
            await DisconnectII();
            await ConnectPlug();
        }
    };
    //**II**//
    /*Only IC Network */
    const ButtonClickII = async () => {
        //disconnect
        if (auth_client_stored) {
            await DisconnectStoic();
            await DisconnectPlug();
            await DisconnectII();
            if(provider === authProvider.Plug || provider === authProvider.Stoic || provider === authProvider.Undefined){
                await ConnectII();
            }
        }
        //connect
        else {
            await DisconnectPlug();
            await DisconnectStoic();
            await DisconnectII();
            await ConnectII();
        }
    };
    //**II**//
    /*Only IC Network */
    const ConnectII = async () => {
        const options = {
            createOptions: {
                idleOptions: { disableIdle: false, },
            },
            loginOptions: { identityProvider: II, },
        };
        const authClient = await AuthClient.create(options.createOptions);
        await authClient.login({
            ...options.loginOptions,
            onSuccess: () => {
                HandlerConnectII(authClient);
            },
            onError: (error) => {
                console.error('Login Failed: ', error);
                alert(error);
            }
        });
    };
    //**II**//
    /*Only IC Network */
    async function HandlerConnectII(authClient: AuthClient) {
        try {
            let canister_id = CANISTER_RBAC.toString();
            let identity = (await authClient.getIdentity()) as unknown as Identity;
            let principal = identity.getPrincipal().toString()
            const host = IC_URL;
            const agentOptions: HttpAgentOptions = {
                host: host,
                identity: identity,
            };
            let actor = createActor(canister_id, {
                agentOptions: agentOptions
            });
            if (actor) {
                let ac = await actor?.request_client();
                if (ac != null) {
                    let res = ac[0];
                    dispatch(set_authentication_data_context_values({
                        provider: authProvider.II,
                        name_provider: 'II',
                        principal: principal,
                        is_connected_provider: true,
                        actor_identity_context: { ActorIdentity: actor },
                        http_agent_identity_context: undefined,
                        auth_client: res,
                        // token: Token | undefined;
                        is_token_valid: undefined
                    }));
                    if(res){
                        if(Object.keys(res.participant)[0] == "Admin") {
                            await GoNavigatePreloader();
                        }
                        if(Object.keys(res.participant)[0] == "User") {
                            await GoNavigateHome();
                        }
                        setStyleII(ConnectButtonStyles);
                    }
                    else {
                        await GoNavigateHome();
                    }
                }
                else {
                    await DisconnectII();
                    await GoNavigateHome();
                    alert("Unknown error");
                }
            }
        }
        catch (error) {
            console.log(error);
            alert(error);
        };
    };
    //**Plug**//
    const DisconnectII = async () => {
        dispatch(set_authentication_data_context_values({
            provider: authProvider.Undefined,
            name_provider: '',
            principal: undefined,
            is_connected_provider: false,
            actor_identity_context: undefined,
            http_agent_identity_context: undefined,
            auth_client: undefined,
            is_token_valid: undefined
        }));
        setStyleII(ButtonStyles);
    };
    //**Stoic**//
    const ConnectStoic = async () => {
        try {
            let si = await StoicIdentity.connect();
            // const agent = process.env.DFX_NETWORK === ic ? createStoicHttpAgent(identity) : createStoicHttpAgentLocal(identity);
            const agent = NODE_ENV.toString() == 'production' ? createStoicHttpAgent(si) : createStoicHttpAgentLocal(si);
            let canister_id = NODE_ENV.toString() == 'production' ? CANISTER_RBAC.toString() : LOCAL_CANISTER_RBAC.toString();
            const actor = Actor.createActor<service_auth_rbac>(idl_auth_rbac, {
                agent,
                canisterId: Principal.fromText(canister_id)
            });

            if (actor) {
                let ac = await actor?.request_client();
                if (ac != null) {
                    let res = ac[0];
                    dispatch(set_authentication_data_context_values({
                        provider: authProvider.Stoic,
                        name_provider: 'Stoic',
                        principal: si.getPrincipal().toString(),
                        is_connected_provider: true,
                        actor_identity_context: { ActorIdentity: actor },
                        http_agent_identity_context: undefined,
                        auth_client: res,
                        is_token_valid: undefined
                    }));
                    if(res){
                        if(Object.keys(res.participant)[0] == "Admin") {
                            await GoNavigatePreloader();
                        }
                        if(Object.keys(res.participant)[0] == "User") {
                            await GoNavigateHome();
                        }
                        setStyleStoic(ConnectButtonStyles);
                    }
                    else {
                        await GoNavigateHome();
                    }
                }
                else {
                    await DisconnectStoic();
                    await GoNavigateHome();
                    alert("Unknown error");
                }
            }
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
    };

    //**Stoic**//
    const DisconnectStoic = async () => {
        dispatch(set_authentication_data_context_values({
            provider: authProvider.Undefined,
            name_provider: '',
            principal: undefined,
            is_connected_provider: false,
            actor_identity_context: undefined,
            http_agent_identity_context: undefined,
            auth_client: undefined,
            is_token_valid: undefined
        }));
        await StoicIdentity.disconnect();
        setStyleStoic(ButtonStyles);
    };

    //**Plug**//
    const ConnectPlug = async () => {
        try {
            if (!(window as any).ic?.plug) {
                window.open(PLUG, '_blank');
                return;
            }
            // let plug: ActorSubclassCreate = process.env.DFX_NETWORK === ic ? await createPlugActor() : await createPlugActorLocal();
            let plug: ActorSubclassCreate = NODE_ENV.toString() == 'production' ? await createPlugActor() : await createPlugActorLocal();
            let actor = plug.actor;
            const principal = await (window as any)?.ic?.plug?.agent.getPrincipal();
            let canister_id = NODE_ENV.toString() == 'production' ? CANISTER_RBAC.toString() : LOCAL_CANISTER_RBAC.toString();
            if (actor) {
                let ac = await actor?.request_client();
                if (ac != null) {
                    let res = ac[0];
                    dispatch(set_authentication_data_context_values({
                        provider: authProvider.Plug,
                        name_provider: 'Plug',
                        principal: principal.toString(),
                        is_connected_provider: true,
                        actor_identity_context: { ActorIdentity: actor },
                        http_agent_identity_context: undefined,
                        auth_client: res,
                        is_token_valid: undefined
                    }));
                    if(res){
                        if(Object.keys(res.participant)[0] == "Admin") {
                            await GoNavigatePreloader();
                        }
                        if(Object.keys(res.participant)[0] == "User") {
                            await GoNavigateHome();
                        }
                        setStylePlug(ConnectButtonStyles);
                    }
                    else {
                        await GoNavigateHome();
                    }
                }
                else {
                    await DisconnectStoic();
                    await GoNavigateHome();
                    alert("Unknown error");
                }
            }
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
    };
    //**Plug**//
    const DisconnectPlug = async () => {
        dispatch(set_authentication_data_context_values({
            provider: authProvider.Undefined,
            name_provider: '',
            principal: undefined,
            is_connected_provider: false,
            actor_identity_context: undefined,
            http_agent_identity_context: undefined,
            auth_client: undefined,
            is_token_valid: undefined
        }));
        setStylePlug(ButtonStyles);
    };

    const GoNavigatePreloader = async () => {
        // preloader navigate
        navigate("preloader");
    }
    const GoNavigateHome = async () => {
        // home navigate
        navigate("/");
    }

    return (
        <div className="row gx-2">
            <div className="col">
                <Button disabled={false}
                        onClick={() => ButtonClickStoic()}
                        style={styleStoic}> Stoic
                </Button>
            </div>
            <div className="col">
                <Button disabled={false}
                        onClick={() => ButtonClickII()}
                        style={styleII}> IIdentity
                </Button>
            </div>
            {/*Plug don't  work https://forum.dfinity.org/t/creating-a-web-canister/20460/29
             fetchRootKey() */}
            <div className="col">
                {/*<Button disabled={true}*/}
                {/*    onClick={() => ButtonClickPlug()}*/}
                {/*    style={stylePlug}> Plug*/}
                {/*</Button>*/}
                {/*<Button disabled={false}*/}
                {/*    onClick={() => ButtonClickPlug()}*/}
                {/*    style={stylePlug}> Plug*/}
                {/*</Button>*/}
            </div>
        </div>);

}