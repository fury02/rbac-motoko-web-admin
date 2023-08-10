import Text "mo:base/Text";
import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import List "mo:base/List";

import Lib "mo:rbac-motoko";

import { WEEK; DAY; HOUR; MINUTE; SECOND } "mo:time-consts";
import Map "mo:map/Map";
import CertifiedCache "mo:certified-cache";
import { JSON; Candid } "mo:serde";

import Debug "mo:base/Debug";

import read "demo_web/read";

actor Impl_rbac {

    //***TEMPLATE//

    public type Errors = Lib.Errors;
    public type Duration = Lib.Duration;
    public type Scanner = Lib.Scanner;
    public type Admin = Lib.Admin;
    public type User = Lib.User;
    public type Role = Lib.Role;
    public type Permission = Lib.Permission;
    public type Admins = Lib.Admins;
    public type Users = Lib.Users;
    public type Roles = Lib.Roles;
    public type Permissions = Lib.Permissions;
    public type ListRelatedRP = Lib.ListRelatedRP;
    public type ArrayRelatedRP = Lib.ArrayRelatedRP;
    public type ObjectRP = Lib.ObjectRP;
    public type RelatedRP = Lib.RelatedRP;
    public type JTI = Lib.JTI;
    public type Token = Lib.Token;
    public type AuthClient = Lib.AuthClient;
    public type VariantChange = Lib.VariantChange;
    public type Participant = Lib.Participant;
    public type Alg = Lib.Alg;
    public type TypeToken = Lib.TypeToken;
    public type Header = Lib.Header;
    public type Payload = Lib.Payload;
    public type SETTINGS_TIME = Lib.SETTINGS_TIME;

    public shared ({ caller }) func whoami_caller() : async Text {
        Principal.toText(caller);
    };
    private func self() : Principal {
        Principal.fromActor(Impl_rbac);
    };

    //auth_client lifetime
    //https://github.com/ZenVoich/time-consts
    //31 DAY
    // private let default_settings: SETTINGS_TIME = Lib.default_settings_31day;
    //24 HOUR
    // private let default_settings: SETTINGS_TIME = Lib.default_settings_24hour;
    //180 min
    private let default_settings : SETTINGS_TIME = Lib.default_settings_180min; 
    //2 min
    // private let default_settings: SETTINGS_TIME = Lib.default_settings_2min;
    //timer
    private let _exp = default_settings.exp_regarding * default_settings.type_time; //(24*HOUR) = Day 

    //store
    private let { n32hash } = Map;
    private let { thash } = Map;
    private let { phash } = Map;

    //certified acting_clients
    //https://github.com/krpeacock/certified-cache
    private stable var _cert_entries_acting_clients : [(Principal, (AuthClient, Nat))] = []; //entries : [(K, (V, Nat))]
    var _cert_acting_clients = CertifiedCache.fromEntries<Principal, AuthClient>(
        _cert_entries_acting_clients,
        Principal.equal,
        Principal.hash,
        func(p : Principal) : Blob { Principal.toBlob(p) },
        func(ac : AuthClient) : Blob { to_candid (ac) }, //https://github.com/NatLabs/serde
        _exp + Int.abs(Time.now()),
    );

    //stable collections
    //https://github.com/ZhenyaUsenko/motoko-hash-map
    private stable var _acting_clients = Map.new<Principal, AuthClient>(phash);

    private stable var _list_users = Map.new<User, User>(phash);
    private stable var _list_roles = Map.new<Role, ObjectRP>(thash); //reference where Nat count_ref binding roles; timestamp_change time create or change
    private stable var _list_permissions = Map.new<Permission, ObjectRP>(thash); //reference  where Nat count_ref binding permissions; timestamp_change time create or change

    private stable var _associated_role_permission = Map.new<Role, Permissions>(thash);
    private stable var _associated_user_role = Map.new<User, Roles>(phash);

    //Class lib rbac
    private let lib = Lib.lib_rbac(
        _cert_acting_clients,
        _list_users,
        _list_roles,
        _list_permissions,
        _associated_role_permission,
        _associated_user_role,
        _exp,
    );

    //***dev//
    public shared ({ caller }) func init() : async Result.Result<Admins, Errors> {
        await lib.init(caller, self);
    };
    public shared ({ caller }) func status() : async Result.Result<{ cycles : Nat; freezing_threshold : Nat; memory_size : Nat; module_hash : ?Blob; settings : Lib.definite_canister_settings; status : { #running; #stopped; #stopping } }, Errors> {
        await lib.status(caller, self);
    };
    public shared ({ caller }) func _users_() : async Result.Result<Users, Errors> {
        await lib._users_(caller, self);
    };
    //dev***//
    public shared ({ caller }) func controller(client : AuthClient) : async Result.Result<Bool, Errors> {
        lib.controller(caller : Principal, client : AuthClient);
    };
    public shared ({ caller }) func add_admin(user : Admin) : async Result.Result<Admin, Errors> {
        await lib.add_admin(user, caller, self);
    };
    public shared ({ caller }) func delete_admin(user : Admin) : async Result.Result<Admin, Errors> {
        await lib.delete_admin(user, caller, self);
    };
    public shared ({ caller }) func admins() : async Result.Result<Admins, Errors> {
        await lib.admins(caller, self);
    };
    public shared ({ caller }) func add_user(user : User, client : AuthClient) : async Result.Result<User, Errors> {
        await lib.add_user(user, client, caller);
    };
    public shared ({ caller }) func delete_user(user : User, client : AuthClient) : async Result.Result<User, Errors> {
        await lib.delete_user(user, client, caller);
    };
    public shared ({ caller }) func contains_user(user : User, client : AuthClient) : async Result.Result<User, Errors> {
        await lib.contains_user(user, client, caller);
    };
    public shared ({ caller }) func users(client : AuthClient) : async Result.Result<Users, Errors> {
        await lib.users(client, caller);
    };
    public shared ({ caller }) func add_role(role : Role, client : AuthClient) : async Result.Result<Role, Errors> {
        await lib.add_role(role, client, caller);
    };
    public shared ({ caller }) func delete_role(role : Role, client : AuthClient) : async Result.Result<Role, Errors> {
        await lib.delete_role(role, client, caller);
    };
    public shared ({ caller }) func get_role(role : Role, client : AuthClient) : async Result.Result<ObjectRP, Errors> {
        await lib.get_role(role, client, caller);
    };
    public shared ({ caller }) func roles(client : AuthClient) : async Result.Result<Roles, Errors> {
        await lib.roles(client, caller);
    };
    public shared ({ caller }) func roles_permissions(client : AuthClient) : async Result.Result<ArrayRelatedRP, Errors> {
        await lib.roles_permissions(client, caller);
    };
    public shared ({ caller }) func user_roles(user : User, client : AuthClient) : async Result.Result<ArrayRelatedRP, Errors> {
        await lib.user_roles(user, client, caller);
    };
    public shared ({ caller }) func add_permission(permission : Permission, client : AuthClient) : async Result.Result<Permission, Errors> {
        await lib.add_permission(permission, client, caller);
    };
    public shared ({ caller }) func delete_permission(permission : Permission, client : AuthClient) : async Result.Result<Permission, Errors> {
        await lib.delete_permission(permission, client, caller);
    };
    public shared ({ caller }) func get_permission(permission : Permission, client : AuthClient) : async Result.Result<ObjectRP, Errors> {
        await lib.get_permission(permission, client, caller);
    };
    public shared ({ caller }) func permissions(client : AuthClient) : async Result.Result<Permissions, Errors> {
        await lib.permissions(client, caller);
    };
    public shared ({ caller }) func bind_permission(permission : Permission, role : Role, client : AuthClient) : async Result.Result<Permissions, Errors> {
        await lib.bind_permission(permission, role, client, caller);
    };
    public shared ({ caller }) func unbind_permission(permission : Permission, role : Role, client : AuthClient) : async Result.Result<Permissions, Errors> {
        await lib.unbind_permission(permission, role, client, caller);
    };
    public shared ({ caller }) func bind_role(user : User, role : Role, client : AuthClient) : async Result.Result<Roles, Errors> {
        await lib.bind_role(user, role, client, caller);
    };
    public shared ({ caller }) func unbind_role(user : User, role : Role, client : AuthClient) : async Result.Result<Roles, Errors> {
        await lib.unbind_role(user, role, client, caller);
    };
    public shared ({ caller }) func auth_client() : async Result.Result<AuthClient, Errors> {
        await lib.auth_client(caller, self);
    };
    public shared ({ caller }) func request_client() : async ?AuthClient {
        await lib.request_client(caller, self);
    };
    public shared ({ caller }) func delete_client(client : AuthClient) : async Result.Result<Bool, Errors> {
        await lib.delete_client(client, caller);
    };
    public shared ({ caller }) func valid_client() : async Bool {
        await lib.valid_client(caller);
    };

    //canister upgrade
    system func preupgrade() {
        let vals : Iter.Iter<(Principal, (AuthClient, Nat))> = Iter.fromArray<(Principal, (AuthClient, Nat))>(_cert_acting_clients.entries());
        for ((p, (c, n)) in vals) {
            ignore Map.put(_acting_clients, phash, p, c);
        };
        let _ = _cert_acting_clients.pruneAll();
    };
    system func postupgrade() {
        let entries : Iter.Iter<(Principal, AuthClient)> = Map.entries<Principal, AuthClient>(_acting_clients);
        for ((p, c) in entries) {
            _cert_acting_clients.put(p, c, ?Int.abs(c.token.payload.exp));
        };
        Map.clear<Principal, AuthClient>(_acting_clients);
    };

    //END TEMPLATE***//




    //***sample web//
    //1
    //Check authClient and caller
    // Full verification includes:
    // -сhecking the caller on the server and the token for their identity
    // -verification of the stored token for the caller and the issued roles n in compliance
    public shared ({ caller }) func read_array(client : AuthClient) : async [Nat] {
        await read.read_array(lib, caller, client);
    };
    //2
    //Check authClient
    // Verification includes:
    // -verification of the stored token for the caller and the issued roles n in compliance
    public func anonymous_read_array(client : AuthClient) : async [Nat] {
        await read.anonymous_read_array(lib, client);
    };
    //3
    //Non Check backend. Check in web app.
    //Checking in the WEB application for compliance with the assigned roles
    public func indisputable_read_array() : async [Nat] {
        await read.indisputable_read_array();
    };
    //sample web***//
};
