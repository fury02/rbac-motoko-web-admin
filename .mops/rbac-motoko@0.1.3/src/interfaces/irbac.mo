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
    public type IRbac = actor {
        // //dev
        _users_ : () -> async Result.Result<Users, Errors>;
        //init rbac
        init : () -> async Result.Result<Admins, Errors>;
        controller: (client : AuthClient) -> async Result.Result<Bool, Errors>;
        //others
        whoami_caller : () -> async Text;
        canister_id : () -> async Principal;
        //admins
        add_admin : (user : User) -> async Result.Result<User, Errors>;
        delete_admin : (user : User) -> async Result.Result<User, Errors>;
        admins : () -> async Result.Result<Admins, Errors>;
        //user
        add_user : (user : User, client : AuthClient) -> async Result.Result<User, Errors>;
        delete_user : (user : User, client : AuthClient) -> async Result.Result<User, Errors>;
        contains_user : (user : User, client : AuthClient) -> async Result.Result<User, Errors>;
        users : (client : AuthClient) -> async Result.Result<Users, Errors>;
        roles_permissions: (client : AuthClient) -> async Result.Result<ArrayRelatedRP, Errors>;
        user_roles : (user : User, client : AuthClient) -> async Result.Result<ArrayRelatedRP, Errors>;
        //role
        add_role : (role : Role, client : AuthClient) -> async Result.Result<Role, Errors>;
        delete_role : (role : Role, client : AuthClient) -> async Result.Result<Role, Errors>;
        get_role : (role : Role, client : AuthClient) -> async Result.Result<ObjectRP, Errors>;
        roles : (client : AuthClient) -> async Result.Result<Roles, Errors>;
        //permission
        add_permission : (permission : Permission, client : AuthClient) -> async Result.Result<Permission, Errors>;
        delete_permission : (permission : Permission, client : AuthClient) -> async Result.Result<Permission, Errors>;
        get_permission : (permission : Permission, client : AuthClient) -> async Result.Result<ObjectRP, Errors>;
        permissions : (client : AuthClient) -> async Result.Result<Permissions, Errors>;
        //(un)bind
        bind_permission : (permission : Permission, role : Role, client : AuthClient) -> async Result.Result<Permissions, Errors>;
        unbind_permission : (permission : Permission, role : Role, client : AuthClient) -> async Result.Result<Permissions, Errors>;
        bind_role : (user : User, role : Role, client : AuthClient) -> async Result.Result<Roles, Errors>;
        unbind_role : (user : User, role : Role, client : AuthClient) -> async Result.Result<Roles, Errors>;
        //client
        auth_client : () -> async Result.Result<AuthClient, Errors>;
        request_client : () -> async ?AuthClient;
        delete_client : (client : AuthClient) -> async Result.Result<Bool, Errors>;
        valid_client : () -> async Bool;
    };
};
