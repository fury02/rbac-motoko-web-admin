import Types "../types/types";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Bool "mo:base/Bool";
import Result "mo:base/Result";

module {
    type Errors = Types.Errors;
    type Duration = Types.Duration;
    type Scanner = Types.Scanner;
    type Admin = Types.Admin;
    type User = Types.User;
    type Role = Types.Role;
    type Permission = Types.Permission;
    type Admins = Types.Admins;
    type Users = Types.Users;
    type Roles = Types.Roles;
    type Permissions = Types.Permissions;
    type ArrayRelatedRP = Types.ArrayRelatedRP;
    type ListRelatedRP = Types.ListRelatedRP;
    type ObjectRP = Types.ObjectRP;
    type CountRef = Types.CountRef;
    type RelatedRP = Types.RelatedRP;
    type JTI = Types.JTI;
    type Token = Types.Token;
    type AuthClient = Types.AuthClient;
    public type ILib = actor {
        // //dev
        _users_ : () -> async Result.Result<Users, Errors>;
        //init rbac
        init : (caller : Principal, self : shared () -> async Principal) -> async Result.Result<Admins, Errors>;
        controller: (caller : Principal, client : AuthClient) -> async Result.Result<Bool, Errors>;
        //admins
        add_admin : (user : User, caller : Principal, self : shared () -> async Principal) -> async Result.Result<User, Errors>;
        delete_admin : (user : User, caller : Principal, self : shared () -> async Principal) -> async Result.Result<User, Errors>;
        admins : (caller : Principal, self : shared () -> async Principal) -> async Result.Result<Admins, Errors>;
        //user
        add_user : (user : User, client : AuthClient, caller : Principal) -> async Result.Result<User, Errors>;
        delete_user : (user : User, client : AuthClient, caller : Principal) -> async Result.Result<User, Errors>;
        contains_user : (user : User, client : AuthClient, caller : Principal) -> async Result.Result<User, Errors>;
        users : (client : AuthClient, caller : Principal) -> async Result.Result<Users, Errors>;
        roles_permissions: (client : AuthClient, caller : Principal) -> async Result.Result<ArrayRelatedRP, Errors>;
        user_roles : (user : User, client : AuthClient, caller : Principal) -> async Result.Result<ArrayRelatedRP, Errors>;
        //role
        add_role : (role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Role, Errors>;
        delete_role : (role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Role, Errors>;
        get_role : (role : Role, client : AuthClient, caller : Principal) -> async Result.Result<ObjectRP, Errors>;
        roles : (client : AuthClient, caller : Principal) -> async Result.Result<Roles, Errors>;
        //permission
        add_permission : (permission : Permission, client : AuthClient, caller : Principal) -> async Result.Result<Permission, Errors>;
        delete_permission : (permission : Permission, client : AuthClient, caller : Principal) -> async Result.Result<Permission, Errors>;
        get_permission : (permission : Permission, client : AuthClient, caller : Principal) -> async Result.Result<ObjectRP, Errors>;
        permissions : (client : AuthClient, caller : Principal) -> async Result.Result<Permissions, Errors>;
        //(un)bind
        bind_permission : (permission : Permission, role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Permissions, Errors>;
        unbind_permission : (permission : Permission, role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Permissions, Errors>;
        bind_role : (user : User, role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Roles, Errors>;
        unbind_role : (user : User, role : Role, client : AuthClient, caller : Principal) -> async Result.Result<Roles, Errors>;
        user_rp : (user : User) -> async ArrayRelatedRP;
        get_user_rp : (user : User, caller: Principal, self : shared () -> async Principal) -> async Result.Result<ArrayRelatedRP, Errors>;
        //client
        auth_client : (caller : Principal, self : shared () -> async Principal) -> async Result.Result<AuthClient, Errors>;
        request_client : (caller : Principal, self : shared () -> async Principal) -> async ?AuthClient;
        delete_client : (client : AuthClient, caller : Principal) -> async Result.Result<Bool, Errors>;
        valid_client : (caller : Principal) -> async Bool;
    };
};
