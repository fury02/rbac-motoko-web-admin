import { HttpAgent } from '@dfinity/agent';
import {ActorSubclass} from "@dfinity/agent";
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/Store';
import {AuthenticationDataContext} from "./AuthenticationDataContext";
import {_SERVICE as service_auth_rbac, AuthClient, Token} from "../../../declarations/rbac/rbac.did";

export enum authProvider { II, Stoic, Plug,Undefined };
export interface IActorIdentity{
    ActorIdentity: ActorSubclass<service_auth_rbac> | undefined;
};
export interface IHttpAgentIdentity{
    HttpAgent: HttpAgent | undefined;
};
//Auth connect
export interface IAuthenticationDataContext{
    provider: authProvider;
    name_provider: string;
    principal: string | undefined;
    is_connected_provider: boolean;
    actor_identity_context: IActorIdentity;
    http_agent_identity_context: IHttpAgentIdentity;
    auth_client: AuthClient | undefined;
    is_token_valid: boolean | undefined;
};

export interface AuthenticationDataContextState {
    authentication_data_context: IAuthenticationDataContext;
    status: 'idle' | 'loading' | 'failed';
};

const initialState: AuthenticationDataContextState  = {
    authentication_data_context: {
        provider: authProvider.Undefined,
        name_provider: '',
        principal: undefined,
        is_connected_provider: false,
        actor_identity_context: { ActorIdentity: undefined },
        http_agent_identity_context: { HttpAgent: undefined },
        auth_client: undefined,
        // token: undefined,
        is_token_valid: undefined
    },
    status: 'idle',
};

export const authenticationDataContextSlice = createSlice({
    name: 'authentication data context context reducer',
    initialState,
    reducers: {
        set_authentication_data_context_values: (state, action) => {
            state.authentication_data_context = action.payload;
        },
    },
});

export const { set_authentication_data_context_values } = authenticationDataContextSlice.actions;
export const selectAuthenticationDataContextValues = (state: RootState) => state.authentication_data_context_values.authentication_data_context

export default authenticationDataContextSlice.reducer;