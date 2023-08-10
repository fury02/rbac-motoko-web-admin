import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Admin = Principal;
export type Admin__1 = Principal;
export type Admins = Array<Admin>;
export type Alg = { 'NONE' : null };
export type ArrayRelatedRP = Array<RelatedRP>;
export type ArrayRelatedRP__1 = Array<RelatedRP>;
export interface AuthClient { 'token' : Token, 'participant' : Participant }
export type CountRef = bigint;
export type Errors = { 'invalid_caller' : null } |
  { 'contain' : null } |
  { 'access_error' : null } |
  { 'invalid_client' : null } |
  { 'error_add' : null } |
  { 'bind_failed' : null } |
  { 'unbind_failed' : null } |
  { 'not_contain' : null } |
  { 'error_delete' : null } |
  { 'invalid_token' : null };
export interface Header { 'alg' : Alg, 'typ' : TypeToken }
export type JTI = string;
export type List = [] | [[RelatedRP, List]];
export type ListRelatedRP = [] | [[RelatedRP, List]];
export interface ObjectRP {
  'name' : string,
  'count_ref' : CountRef,
  'timestamp_change' : Time,
  'variant_change' : VariantChange,
}
export type Participant = { 'User' : null } |
  { 'Admin' : null };
export interface Payload {
  'arp' : ArrayRelatedRP,
  'aud' : string,
  'exp' : bigint,
  'iat' : string,
  'iss' : string,
  'jti' : JTI,
  'lrp' : [] | [ListRelatedRP],
  'nbf' : string,
  'sub' : string,
  'principal' : Principal,
}
export type Permission = string;
export type Permission__1 = string;
export type Permissions = Array<Permission>;
export type Permissions__1 = Array<Permission>;
export interface RelatedRP { 'permissions' : Permissions, 'role' : Role }
export type Result = { 'ok' : Users } |
  { 'err' : Errors };
export type Result_1 = { 'ok' : ArrayRelatedRP__1 } |
  { 'err' : Errors };
export type Result_10 = { 'ok' : boolean } |
  { 'err' : Errors };
export type Result_11 = { 'ok' : Admin__1 } |
  { 'err' : Errors };
export type Result_12 = { 'ok' : AuthClient } |
  { 'err' : Errors };
export type Result_2 = { 'ok' : Roles } |
  { 'err' : Errors };
export type Result_3 = { 'ok' : Permissions__1 } |
  { 'err' : Errors };
export type Result_4 = {
    'ok' : {
      'status' : { 'stopped' : null } |
        { 'stopping' : null } |
        { 'running' : null },
      'freezing_threshold' : bigint,
      'memory_size' : bigint,
      'cycles' : bigint,
      'settings' : definite_canister_settings,
      'module_hash' : [] | [Uint8Array | number[]],
    }
  } |
  { 'err' : Errors };
export type Result_5 = { 'ok' : Admins } |
  { 'err' : Errors };
export type Result_6 = { 'ok' : ObjectRP } |
  { 'err' : Errors };
export type Result_7 = { 'ok' : User__1 } |
  { 'err' : Errors };
export type Result_8 = { 'ok' : Role__1 } |
  { 'err' : Errors };
export type Result_9 = { 'ok' : Permission__1 } |
  { 'err' : Errors };
export type Role = string;
export type Role__1 = string;
export type Roles = Array<Role>;
export type Time = bigint;
export interface Token { 'payload' : Payload, 'header' : Header }
export type TypeToken = { 'JWT' : null } |
  { 'UJWT' : null };
export type User = Principal;
export type User__1 = Principal;
export type Users = Array<User>;
export type VariantChange = { 'Bind' : null } |
  { 'Unbind' : null } |
  { 'Created' : null };
export interface definite_canister_settings {
  'freezing_threshold' : bigint,
  'controllers' : Array<Principal>,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface _SERVICE {
  '_users' : ActorMethod<[], Result>,
  'add_admin' : ActorMethod<[Admin__1], Result_11>,
  'add_permission' : ActorMethod<[Permission__1, AuthClient], Result_9>,
  'add_role' : ActorMethod<[Role__1, AuthClient], Result_8>,
  'add_user' : ActorMethod<[User__1, AuthClient], Result_7>,
  'admins' : ActorMethod<[], Result_5>,
  'anonymous_read_array' : ActorMethod<[AuthClient], Array<bigint>>,
  'auth_client' : ActorMethod<[], Result_12>,
  'bind_permission' : ActorMethod<
    [Permission__1, Role__1, AuthClient],
    Result_3
  >,
  'bind_role' : ActorMethod<[User__1, Role__1, AuthClient], Result_2>,
  'contains_user' : ActorMethod<[User__1, AuthClient], Result_7>,
  'controller' : ActorMethod<[AuthClient], Result_10>,
  'delete_admin' : ActorMethod<[Admin__1], Result_11>,
  'delete_client' : ActorMethod<[AuthClient], Result_10>,
  'delete_permission' : ActorMethod<[Permission__1, AuthClient], Result_9>,
  'delete_role' : ActorMethod<[Role__1, AuthClient], Result_8>,
  'delete_user' : ActorMethod<[User__1, AuthClient], Result_7>,
  'get_permission' : ActorMethod<[Permission__1, AuthClient], Result_6>,
  'get_role' : ActorMethod<[Role__1, AuthClient], Result_6>,
  'indisputable_read_array' : ActorMethod<[], Array<bigint>>,
  'init' : ActorMethod<[], Result_5>,
  'permissions' : ActorMethod<[AuthClient], Result_3>,
  'read_array' : ActorMethod<[AuthClient], Array<bigint>>,
  'request_client' : ActorMethod<[], [] | [AuthClient]>,
  'roles' : ActorMethod<[AuthClient], Result_2>,
  'roles_permissions' : ActorMethod<[AuthClient], Result_1>,
  'status' : ActorMethod<[], Result_4>,
  'unbind_permission' : ActorMethod<
    [Permission__1, Role__1, AuthClient],
    Result_3
  >,
  'unbind_role' : ActorMethod<[User__1, Role__1, AuthClient], Result_2>,
  'user_roles' : ActorMethod<[User__1, AuthClient], Result_1>,
  'users' : ActorMethod<[AuthClient], Result>,
  'valid_client' : ActorMethod<[], boolean>,
  'whoami_caller' : ActorMethod<[], string>,
}
