export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const User = IDL.Principal;
  const Users = IDL.Vec(User);
  const Errors = IDL.Variant({
    'invalid_caller' : IDL.Null,
    'contain' : IDL.Null,
    'access_error' : IDL.Null,
    'invalid_client' : IDL.Null,
    'error_add' : IDL.Null,
    'bind_failed' : IDL.Null,
    'unbind_failed' : IDL.Null,
    'not_contain' : IDL.Null,
    'error_delete' : IDL.Null,
    'invalid_token' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : Users, 'err' : Errors });
  const Admin__1 = IDL.Principal;
  const Result_11 = IDL.Variant({ 'ok' : Admin__1, 'err' : Errors });
  const Permission__1 = IDL.Text;
  const Permission = IDL.Text;
  const Permissions = IDL.Vec(Permission);
  const Role = IDL.Text;
  const RelatedRP = IDL.Record({ 'permissions' : Permissions, 'role' : Role });
  const ArrayRelatedRP = IDL.Vec(RelatedRP);
  const JTI = IDL.Text;
  List.fill(IDL.Opt(IDL.Tuple(RelatedRP, List)));
  const ListRelatedRP = IDL.Opt(IDL.Tuple(RelatedRP, List));
  const Payload = IDL.Record({
    'arp' : ArrayRelatedRP,
    'aud' : IDL.Text,
    'exp' : IDL.Int,
    'iat' : IDL.Text,
    'iss' : IDL.Text,
    'jti' : JTI,
    'lrp' : IDL.Opt(ListRelatedRP),
    'nbf' : IDL.Text,
    'sub' : IDL.Text,
    'principal' : IDL.Principal,
  });
  const Alg = IDL.Variant({ 'NONE' : IDL.Null });
  const TypeToken = IDL.Variant({ 'JWT' : IDL.Null, 'UJWT' : IDL.Null });
  const Header = IDL.Record({ 'alg' : Alg, 'typ' : TypeToken });
  const Token = IDL.Record({ 'payload' : Payload, 'header' : Header });
  const Participant = IDL.Variant({ 'User' : IDL.Null, 'Admin' : IDL.Null });
  const AuthClient = IDL.Record({
    'token' : Token,
    'participant' : Participant,
  });
  const Result_9 = IDL.Variant({ 'ok' : Permission__1, 'err' : Errors });
  const Role__1 = IDL.Text;
  const Result_8 = IDL.Variant({ 'ok' : Role__1, 'err' : Errors });
  const User__1 = IDL.Principal;
  const Result_7 = IDL.Variant({ 'ok' : User__1, 'err' : Errors });
  const Admin = IDL.Principal;
  const Admins = IDL.Vec(Admin);
  const Result_5 = IDL.Variant({ 'ok' : Admins, 'err' : Errors });
  const Result_12 = IDL.Variant({ 'ok' : AuthClient, 'err' : Errors });
  const Permissions__1 = IDL.Vec(Permission);
  const Result_3 = IDL.Variant({ 'ok' : Permissions__1, 'err' : Errors });
  const Roles = IDL.Vec(Role);
  const Result_2 = IDL.Variant({ 'ok' : Roles, 'err' : Errors });
  const Result_10 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : Errors });
  const CountRef = IDL.Nat;
  const Time = IDL.Int;
  const VariantChange = IDL.Variant({
    'Bind' : IDL.Null,
    'Unbind' : IDL.Null,
    'Created' : IDL.Null,
  });
  const ObjectRP = IDL.Record({
    'name' : IDL.Text,
    'count_ref' : CountRef,
    'timestamp_change' : Time,
    'variant_change' : VariantChange,
  });
  const Result_6 = IDL.Variant({ 'ok' : ObjectRP, 'err' : Errors });
  const ArrayRelatedRP__1 = IDL.Vec(RelatedRP);
  const Result_1 = IDL.Variant({ 'ok' : ArrayRelatedRP__1, 'err' : Errors });
  const definite_canister_settings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Record({
      'status' : IDL.Variant({
        'stopped' : IDL.Null,
        'stopping' : IDL.Null,
        'running' : IDL.Null,
      }),
      'freezing_threshold' : IDL.Nat,
      'memory_size' : IDL.Nat,
      'cycles' : IDL.Nat,
      'settings' : definite_canister_settings,
      'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    'err' : Errors,
  });
  return IDL.Service({
    '_users' : IDL.Func([], [Result], []),
    'add_admin' : IDL.Func([Admin__1], [Result_11], []),
    'add_permission' : IDL.Func([Permission__1, AuthClient], [Result_9], []),
    'add_role' : IDL.Func([Role__1, AuthClient], [Result_8], []),
    'add_user' : IDL.Func([User__1, AuthClient], [Result_7], []),
    'admins' : IDL.Func([], [Result_5], []),
    'anonymous_read_array' : IDL.Func([AuthClient], [IDL.Vec(IDL.Nat)], []),
    'auth_client' : IDL.Func([], [Result_12], []),
    'bind_permission' : IDL.Func(
        [Permission__1, Role__1, AuthClient],
        [Result_3],
        [],
      ),
    'bind_role' : IDL.Func([User__1, Role__1, AuthClient], [Result_2], []),
    'contains_user' : IDL.Func([User__1, AuthClient], [Result_7], []),
    'controller' : IDL.Func([AuthClient], [Result_10], []),
    'delete_admin' : IDL.Func([Admin__1], [Result_11], []),
    'delete_client' : IDL.Func([AuthClient], [Result_10], []),
    'delete_permission' : IDL.Func([Permission__1, AuthClient], [Result_9], []),
    'delete_role' : IDL.Func([Role__1, AuthClient], [Result_8], []),
    'delete_user' : IDL.Func([User__1, AuthClient], [Result_7], []),
    'get_permission' : IDL.Func([Permission__1, AuthClient], [Result_6], []),
    'get_role' : IDL.Func([Role__1, AuthClient], [Result_6], []),
    'indisputable_read_array' : IDL.Func([], [IDL.Vec(IDL.Nat)], []),
    'init' : IDL.Func([], [Result_5], []),
    'permissions' : IDL.Func([AuthClient], [Result_3], []),
    'read_array' : IDL.Func([AuthClient], [IDL.Vec(IDL.Nat)], []),
    'request_client' : IDL.Func([], [IDL.Opt(AuthClient)], []),
    'roles' : IDL.Func([AuthClient], [Result_2], []),
    'roles_permissions' : IDL.Func([AuthClient], [Result_1], []),
    'status' : IDL.Func([], [Result_4], []),
    'unbind_permission' : IDL.Func(
        [Permission__1, Role__1, AuthClient],
        [Result_3],
        [],
      ),
    'unbind_role' : IDL.Func([User__1, Role__1, AuthClient], [Result_2], []),
    'user_roles' : IDL.Func([User__1, AuthClient], [Result_1], []),
    'users' : IDL.Func([AuthClient], [Result], []),
    'valid_client' : IDL.Func([], [IDL.Bool], []),
    'whoami_caller' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
