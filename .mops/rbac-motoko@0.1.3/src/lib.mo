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

import Types "types/types";
import Settings "eternal/settings";
import IC "ic/manager-ic";
import JWT "token/jwt";
import { WEEK; DAY; HOUR; MINUTE; SECOND } "mo:time-consts";
import Map "mo:map/Map";
import CertifiedCache "mo:certified-cache";
import { JSON; Candid } "mo:serde";

import Debug "mo:base/Debug";

module {

    public type Errors = Types.Errors;
    public type Duration = Types.Duration;
    public type Scanner = Types.Scanner;
    public type Admin = Types.Admin;
    public type User = Types.User;
    public type Role = Types.Role;
    public type Permission = Types.Permission;
    public type Admins = Types.Admins;
    public type Users = Types.Users;
    public type Roles = Types.Roles;
    public type Permissions = Types.Permissions;
    public type ListRelatedRP = Types.ListRelatedRP;
    public type ArrayRelatedRP = Types.ArrayRelatedRP;
    public type ObjectRP = Types.ObjectRP;
    public type RelatedRP = Types.RelatedRP;
    public type JTI = Types.JTI;
    public type Token = Types.Token;
    public type AuthClient = Types.AuthClient;
    public type VariantChange = Types.VariantChange;
    public type Participant = Types.Participant;
    public type Alg = Types.Alg;
    public type TypeToken = Types.TypeToken;
    public type Header = Types.Header;
    public type Payload = Types.Payload;
    public type SETTINGS_TIME = Types.SETTINGS_TIME;
    public type definite_canister_settings = Types.definite_canister_settings;

    //auth_client lifetime
    //https://github.com/ZenVoich/time-consts
    //31 DAY
    public let default_settings_31day : SETTINGS_TIME = Settings.default_settings_31day;
    //24 HOUR
    public let default_settings_24hour : SETTINGS_TIME = Settings.default_settings_24hour;
    //180 min
    public let default_settings_180min : SETTINGS_TIME = Settings.default_settings_180min;
    //2 min
    public let default_settings_2min : SETTINGS_TIME = Settings.default_settings_2min;

    public class lib_rbac(
        //store:
        cert_acting_clients : CertifiedCache.CertifiedCache<Principal, AuthClient>,
        list_users : Map.Map<User, User>,
        list_roles : Map.Map<Role, ObjectRP>,
        list_permissions : Map.Map<Permission, ObjectRP>,
        associated_role_permission : Map.Map<Role, Permissions>,
        associated_user_role : Map.Map<User, Roles>,
        //settings:
        _exp : Nat,
    ) {

        private let exp = _exp; //token lifetime

        //stable collections
        //https://github.com/ZhenyaUsenko/motoko-hash-map
        private let { n32hash } = Map;
        private let { thash } = Map;
        private let { phash } = Map;

        private var _list_users = list_users;
        private var _list_roles = list_roles; //reference where Nat count_ref binding roles; timestamp_change time create or change
        private var _list_permissions = list_permissions; //reference  where Nat count_ref binding permissions; timestamp_change time create or change

        private var _associated_role_permission = associated_role_permission;
        private var _associated_user_role = associated_user_role;

        //certified acting_clients
        //https://github.com/krpeacock/certified-cache
        private var _cert_acting_clients = cert_acting_clients;

        private func cert_get(principal : Principal) : ?AuthClient {
            _cert_acting_clients.get(principal);
        };
        private func cert_get_time(principal : Principal) : ?Nat {
            _cert_acting_clients.getExpiry(principal);
        };
        private func cert_save(principal : Principal, client : AuthClient, tl : Nat) {
            _cert_acting_clients.put(principal, client, ?tl);
        };
        private func cert_remove(principal : Principal) : ?AuthClient {
            _cert_acting_clients.remove(principal);
        };
        private func cert_replace(principal : Principal, client : AuthClient, tl : Nat) : ?AuthClient {
            _cert_acting_clients.replace(principal, client, ?tl);
        };
        private func cert_delete(principal : Principal) {
            _cert_acting_clients.delete(principal);
        };
        private func cert_entries() : Iter.Iter<(Principal, (AuthClient, Nat))> {
            Iter.fromArray<(Principal, (AuthClient, Nat))>(_cert_acting_clients.entries());
        };
        private func cert_array() : [(Principal, (AuthClient, Nat))] {
            _cert_acting_clients.entries();
        };
        private func cert_vals() : [AuthClient] {
            Iter.toArray(_cert_acting_clients.vals());
        };

        //***Controllers//
        //system controlers canister
        private func is_controller(caller : Principal, self : () -> Principal) : async Bool {
            Array.find<Admin>(await controllers(self), func p = caller == p) != null;
        };
        //system controlers canister
        private func controllers(self : () -> Principal) : async Admins {
            ((await IC.Manager.canister_status({ canister_id = self() })).settings.controllers);
        };
        //controller auth-client
        public func controller(caller : Principal, client : AuthClient) : Result.Result<Bool, Errors> {
            let cert_client : ?AuthClient = cert_get(caller);
            switch (cert_client) {
                case (null) { return #err(#invalid_client) };
                case (?cert_client) {
                    if (
                        (Principal.equal(cert_client.token.payload.principal, caller)) 
                        and
                        (Text.equal(cert_client.token.payload.jti, client.token.payload.jti))
                        ) {
                        return #ok(true);
                    };
                };
            };
            #err(#invalid_token);
        }; 
        //Controllers***//

        //add an administrator to the user list if he is assigned as one of the canister controllers
        public func init(caller : Principal, self : () -> Principal) : async Result.Result<Admins, Errors> {
            if (await is_controller(caller, self)) {
                let admins = await controllers(self);
                for (a in admins.vals()) {
                    ignore Map.put(_list_users, phash, a, a);
                };
                #ok(admins);
            } else {
                return #err(#access_error);
            };
        };
        //status self canister
        public func status(caller : Principal, self : () -> Principal) : async Result.Result<{ cycles : Nat; freezing_threshold : Nat; memory_size : Nat; module_hash : ?Blob; settings : Types.definite_canister_settings; status : { #running; #stopped; #stopping } }, Errors> {
            if (await is_controller(caller, self)) {
                #ok(await IC.Manager.canister_status({ canister_id = self() }));
            } else { return #err(#access_error) };
        };
        //test
        public func _users_(caller : Principal, self : () -> Principal) : async Result.Result<Users, Errors> {
            if (await is_controller(caller, self)) {
                let array = Iter.toArray<User>(Map.vals(_list_users));
                return #ok(array);
            } else { return #err(#access_error) };
        };

        //admin
        public func add_admin(user : Admin, caller : Principal, self : () -> Principal) : async Result.Result<Admin, Errors> {
            if (await is_controller(caller, self)) {
                let status = await IC.Manager.canister_status({
                    canister_id = self();
                });
                let settings : Types.definite_canister_settings = status.settings;
                let controllers : Admins = status.settings.controllers;
                var list = List.nil<Admin>();
                list := List.push<Admin>(user, list);
                let iter = Array.vals<Admin>(controllers);
                for (v in iter) { list := List.push<Admin>(v, list) };
                let new_settings : Types.definite_canister_settings = {
                    controllers = List.toArray(list);
                    compute_allocation = settings.compute_allocation;
                    memory_allocation = settings.memory_allocation;
                    freezing_threshold = settings.freezing_threshold;
                };
                await IC.Manager.update_settings({
                    canister_id = self();
                    settings = new_settings;
                    sender_canister_version = null;
                });
                // ignore await init();
                ignore Map.put(_list_users, phash, user, user);
                return #ok(user);
            } else { return #err(#access_error) };
        };
        //admin
        public func delete_admin(user : Admin, caller : Principal, self : () -> Principal) : async Result.Result<Admin, Errors> {
            if (await is_controller(caller, self)) {
                let status = await IC.Manager.canister_status({
                    canister_id = self();
                });
                let settings : Types.definite_canister_settings = status.settings;
                let controllers : Admins = status.settings.controllers;
                var list = List.nil<Admin>();
                let iter = Array.vals<Admin>(controllers);
                for (v in iter) {
                    if (Principal.equal(v, user)) {} else {
                        list := List.push<Principal>(v, list);
                    };
                };
                let new_settings : Types.definite_canister_settings = {
                    controllers = List.toArray(list);
                    compute_allocation = settings.compute_allocation;
                    memory_allocation = settings.memory_allocation;
                    freezing_threshold = settings.freezing_threshold;
                };
                await IC.Manager.update_settings({
                    canister_id = self();
                    settings = new_settings;
                    sender_canister_version = null;
                });
                Map.delete(_list_users, phash, user);

                gc_client(user : User);//TODO

                return #ok(user);
            } else { return #err(#access_error) };
        };
        //admin
        public func admins(caller : Principal, self : () -> Principal) : async Result.Result<Admins, Errors> {
            if (await is_controller(caller, self)) {
                let status = await IC.Manager.canister_status({
                    canister_id = self();
                });
                let settings : Types.definite_canister_settings = status.settings;
                let controllers : Admins = status.settings.controllers;
                return #ok(controllers);
            } else { return #err(#access_error) };
        };
        //user
        public func add_user(user : User, client : AuthClient, caller : Principal) : async Result.Result<User, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (Bool.equal(Map.has<User, User>(_list_users, phash, user), false)) {
                            ignore Map.put(_list_users, phash, user, user);
                            return #ok(user);
                        } else {
                            return #err(#contain);
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //user
        public func delete_user(user : User, client : AuthClient, caller : Principal) : async Result.Result<User, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (Bool.equal(Map.has<User, User>(_list_users, phash, user), true)) {
                            gc_client(user : User);
                            return #ok(user);
                        } else {
                            return #err(#not_contain);
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //user
        public func contains_user(user : User, client : AuthClient, caller : Principal) : async Result.Result<User, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (Bool.equal(Map.has<User, User>(_list_users, phash, user), true)) {
                            return #ok(user);
                        } else {
                            return #err(#not_contain);
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //user
        public func users(client : AuthClient, caller : Principal) : async Result.Result<Users, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        let array = Iter.toArray<User>(Map.vals(_list_users));
                        return #ok(array);
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func add_role(role : Role, client : AuthClient, caller : Principal) : async Result.Result<Role, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (Bool.equal(Map.has<Role, ObjectRP>(_list_roles, thash, role), false)) {
                            ignore Map.put(_list_roles, thash, role, { name = role; count_ref = 0; timestamp_change = Time.now(); variant_change = #Created });
                            return #ok(role);
                        } else {
                            return #err(#contain);
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func delete_role(role : Role, client : AuthClient, caller : Principal) : async Result.Result<Role, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        let orp : ?ObjectRP = Map.get<Role, ObjectRP>(_list_roles, thash, role);
                        switch (orp) {
                            case (null) { return #err(#not_contain) };
                            case (?orp) {
                                if (Nat.equal(orp.count_ref, 0)) {
                                    let permissions : ?Permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                                    switch (permissions) {
                                        case (?permissions) {
                                            for (permission in Array.vals<Role>(permissions)) {
                                                update_list_permissions_unbind(permission);
                                            };
                                        };
                                        case (null) {};
                                    };
                                    gc_role(role);
                                    return #ok(role);
                                } else {
                                    return #err(#error_delete);
                                };
                            };
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func get_role(role : Role, client : AuthClient, caller : Principal) : async Result.Result<ObjectRP, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        var obj : ?(Role, ObjectRP) = Map.find<Role, ObjectRP>(_list_roles, func(key, value) = key == role);
                        switch (obj) {
                            case (null) { return #err(#not_contain) };
                            case (?obj) {
                                let (name, orp) = obj;
                                return #ok({
                                    name = name;
                                    count_ref = orp.count_ref;
                                    timestamp_change = orp.timestamp_change;
                                    variant_change = orp.variant_change;
                                });
                            };
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func roles(client : AuthClient, caller : Principal) : async Result.Result<Roles, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        let array = Iter.toArray<Role>(Map.keys(_list_roles));
                        return #ok(array);
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func roles_permissions(client : AuthClient, caller : Principal) : async Result.Result<ArrayRelatedRP, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        var list = List.nil<RelatedRP>();
                        let iter : Iter.Iter<(Role, Permissions)> = Map.entries<Role, Permissions>(_associated_role_permission);
                        for ((r, p) in iter) {
                            list := List.push<RelatedRP>({ role = r; permissions = p }, list);
                        };
                        return #ok(List.toArray<RelatedRP>(list));
                    };
                    return #err(#access_error);
                };
            };
        };
        //roles
        public func user_roles(user : User, client : AuthClient, caller : Principal) : async Result.Result<ArrayRelatedRP, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        let roles = Map.get<User, Roles>(_associated_user_role, phash, user);
                        var list = List.nil<RelatedRP>();
                        switch (roles) {
                            case (null) {
                                return #ok(List.toArray<RelatedRP>(list));
                            };
                            case (?roles) {
                                let iter = Array.vals<Role>(roles);
                                for (role in iter) {
                                    let permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                                    switch (permissions) {
                                        case (null) {
                                            list := List.push<RelatedRP>({ role = role; permissions = [] }, list);
                                        };
                                        case (?permissions) {
                                            list := List.push<RelatedRP>({ role = role; permissions = permissions }, list);
                                        };
                                    };
                                };
                            };
                        };
                        return #ok(List.toArray<RelatedRP>(list));
                    };
                    return #err(#access_error);
                };
            };
        };
        //permissions
        public func add_permission(permission : Permission, client : AuthClient, caller : Principal) : async Result.Result<Permission, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (Bool.equal(Map.has<Permission, ObjectRP>(_list_permissions, thash, permission), false)) {
                            ignore Map.put(_list_permissions, thash, permission, { name = permission; count_ref = 0; timestamp_change = Time.now(); variant_change = #Created });
                            return #ok(permission);
                        } else {
                            return #err(#contain);
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //permissions
        public func delete_permission(permission : Permission, client : AuthClient, caller : Principal) : async Result.Result<Permission, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        var orp : ?ObjectRP = Map.get<Permission, ObjectRP>(_list_permissions, thash, permission);
                        switch (orp) {
                            case (null) { return #err(#not_contain) };
                            case (?orp) {
                                if (Nat.equal(orp.count_ref, 0)) {
                                    Map.delete(_list_permissions, thash, permission);
                                    return #ok(permission);
                                } else {
                                    return #err(#error_delete);
                                };
                            };
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //permissions
        public func get_permission(permission : Permission, client : AuthClient, caller : Principal) : async Result.Result<ObjectRP, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        var obj : ?(Permission, ObjectRP) = Map.find<Permission, ObjectRP>(_list_permissions, func(key, value) = key == permission);
                        switch (obj) {
                            case (null) { return #err(#not_contain) };
                            case (?obj) {
                                let (name, orp) = obj;
                                return #ok({
                                    name = name;
                                    count_ref = orp.count_ref;
                                    timestamp_change = orp.timestamp_change;
                                    variant_change = orp.variant_change;
                                });
                            };
                        };
                    };
                    return #err(#access_error);
                };
            };
        };
        //permissions
        public func permissions(client : AuthClient, caller : Principal) : async Result.Result<Permissions, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        let array = Iter.toArray<Permission>(Map.keys(_list_permissions));
                        return #ok(array);
                    };
                    return #err(#access_error);
                };
            };
        };
        //bindings
        public func bind_permission(permission : Permission, role : Role, client : AuthClient, caller : Principal) : async Result.Result<Permissions, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (
                            (Bool.equal(Map.has<Permission, ObjectRP>(_list_permissions, thash, permission), true)) and (Bool.equal(Map.has<Role, ObjectRP>(_list_roles, thash, role), true))
                        ) {
                            let permissions : ?Permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                            switch (permissions) {
                                case (?permissions) {
                                    var list = List.fromArray<Permission>(permissions);
                                    let v = List.find<Permission>(list, func p = permission == p);
                                    switch (v) {
                                        case (?v) { return #err(#contain) };
                                        case (null) {
                                            list := List.push<Permission>(permission, list);
                                        };
                                    };
                                    ignore Map.replace<Role, Permissions>(_associated_role_permission, thash, role, List.toArray(list));
                                    update_list_permissions_bind(permission);
                                    update_acting_clients(role);
                                    return #ok(List.toArray(list));
                                };
                                case (null) {
                                    ignore Map.put<Role, Permissions>(_associated_role_permission, thash, role, [permission]);
                                    update_list_permissions_bind(permission);
                                    update_acting_clients(role);
                                    return #ok([permission]);
                                };
                            };
                        };
                        return #err(#not_contain);
                    };
                    return #err(#access_error);
                };
            };
        };
        //unbindings
        public func unbind_permission(permission : Permission, role : Role, client : AuthClient, caller : Principal) : async Result.Result<Permissions, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (
                            (Bool.equal(Map.has<Permission, ObjectRP>(_list_permissions, thash, permission), true)) and (Bool.equal(Map.has<Role, ObjectRP>(_list_roles, thash, role), true))
                        ) {
                            let permissions : ?Permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                            switch (permissions) {
                                case (?permissions) {
                                    var list = List.filter<Permission>(List.fromArray<Permission>(permissions), func p = permission != p);
                                    let array = List.toArray(list);
                                    ignore Map.replace<Role, Permissions>(_associated_role_permission, thash, role, array);
                                    update_list_permissions_unbind(permission);
                                    update_acting_clients(role);
                                    return #ok(array);
                                };
                                case (null) {
                                    return #err(#unbind_failed);
                                };
                            };
                        };
                        return #err(#not_contain);
                    };
                    return #err(#access_error);
                };
            };
        };
        //bindings
        public func bind_role(user : User, role : Role, client : AuthClient, caller : Principal) : async Result.Result<Roles, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (
                            (Bool.equal(Map.has<Role, ObjectRP>(_list_roles, thash, role), true)) and (Bool.equal(Map.has<User, User>(_list_users, phash, user), true))
                        ) {
                            let roles : ?Roles = Map.get<User, Roles>(_associated_user_role, phash, user);
                            switch (roles) {
                                case (?roles) {
                                    var list = List.fromArray<Role>(roles);
                                    let v = List.find<Role>(list, func p = role == p);
                                    switch (v) {
                                        case (?v) {
                                            return #err(#contain);
                                        };
                                        case (null) {
                                            list := List.push<Role>(role, list);
                                        };
                                    };
                                    ignore Map.replace<User, Roles>(_associated_user_role, phash, user, List.toArray(list));
                                    update_list_roles_bind(role);
                                    update_acting_client(user);
                                    return #ok(List.toArray(list));
                                };
                                case (null) {
                                    ignore Map.put<User, Roles>(_associated_user_role, phash, user, [role]);
                                    update_list_roles_bind(role);
                                    update_acting_client(user);
                                    return #ok([role]);
                                };
                            };
                        };
                        return #err(#not_contain);
                    };
                    return #err(#access_error);
                };
            };
        };
        //unbindings
        public func unbind_role(user : User, role : Role, client : AuthClient, caller : Principal) : async Result.Result<Roles, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    if (client.participant == #Admin) {
                        if (
                            (Bool.equal(Map.has<Role, ObjectRP>(_list_roles, thash, role), true)) and (Bool.equal(Map.has<User, User>(_list_users, phash, user), true))
                        ) {
                            let roles : ?Roles = Map.get<User, Roles>(_associated_user_role, phash, user);
                            switch (roles) {
                                case (?roles) {
                                    var list = List.filter<Role>(List.fromArray<Role>(roles), func p = role != p);
                                    let array = List.toArray(list);
                                    ignore Map.replace<User, Roles>(_associated_user_role, phash, user, array);
                                    update_list_roles_unbind(role);
                                    update_acting_client(user);
                                    return #ok(array);
                                };
                                case (null) {
                                    return #err(#unbind_failed);
                                };
                            };
                        };
                        return #err(#not_contain);
                    };
                    return #err(#access_error);
                };
            };
        };
        //**bindings**//
        private func update_list_permissions_bind(permission : Permission) {
            var orp : ?ObjectRP = Map.get<Permission, ObjectRP>(_list_permissions, thash, permission);
            switch (orp) {
                case (null) {};
                case (?orp) {
                    ignore Map.replace<Permission, ObjectRP>(
                        _list_permissions,
                        thash,
                        permission,
                        {
                            name = permission;
                            count_ref = orp.count_ref + 1;
                            timestamp_change = Time.now();
                            variant_change = #Bind;
                        },
                    );
                };
            };
        };
        private func update_list_permissions_unbind(permission : Permission) {
            let orp : ?ObjectRP = Map.get<Permission, ObjectRP>(_list_permissions, thash, permission);
            switch (orp) {
                case (null) {};
                case (?orp) {
                    ignore Map.replace<Permission, ObjectRP>(
                        _list_permissions,
                        thash,
                        permission,
                        {
                            name = permission;
                            count_ref = orp.count_ref - 1;
                            timestamp_change = Time.now();
                            variant_change = #Unbind;
                        },
                    );
                };
            };
        };
        private func update_list_roles_bind(role : Role) {
            let orp : ?ObjectRP = Map.get<Role, ObjectRP>(_list_roles, thash, role);
            switch (orp) {
                case (null) {};
                case (?orp) {
                    ignore Map.replace<Role, ObjectRP>(
                        _list_roles,
                        thash,
                        role,
                        {
                            name = role;
                            count_ref = orp.count_ref + 1;
                            timestamp_change = Time.now();
                            variant_change = #Bind;
                        },
                    );
                };
            };
        };
        private func update_list_roles_unbind(role : Role) {
            let orp : ?ObjectRP = Map.get<Role, ObjectRP>(_list_roles, thash, role);
            switch (orp) {
                case (null) {};
                case (?orp) {
                    ignore Map.replace<Role, ObjectRP>(
                        _list_roles,
                        thash,
                        role,
                        {
                            name = role;
                            count_ref = orp.count_ref - 1;
                            timestamp_change = Time.now();
                            variant_change = #Unbind;
                        },
                    );
                };
            };
        };
        public func user_rp(user : User) : ArrayRelatedRP {
            let roles = Map.get<User, Roles>(_associated_user_role, phash, user);
            var list = List.nil<RelatedRP>();
            switch (roles) {
                case (null) { return List.toArray<RelatedRP>(list) };
                case (?roles) {
                    let iter = Array.vals<Role>(roles);
                    for (role in iter) {
                        let permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                        switch (permissions) {
                            case (null) {
                                list := List.push<RelatedRP>({ role = role; permissions = [] }, list);
                            };
                            case (?permissions) {
                                list := List.push<RelatedRP>({ role = role; permissions = permissions }, list);
                            };
                        };
                    };
                };
            };
            return List.toArray<RelatedRP>(list);
        };
        public func get_user_rp(user : User, caller : Principal, self : () -> Principal) : async Result.Result<ArrayRelatedRP, Errors> {
            if (await is_controller(caller, self)) {
                let roles = Map.get<User, Roles>(_associated_user_role, phash, user);
                var list = List.nil<RelatedRP>();
                switch (roles) {
                    case (null) { return #ok(List.toArray<RelatedRP>(list)) };
                    case (?roles) {
                        let iter = Array.vals<Role>(roles);
                        for (role in iter) {
                            let permissions = Map.get<Role, Permissions>(_associated_role_permission, thash, role);
                            switch (permissions) {
                                case (null) {
                                    list := List.push<RelatedRP>({ role = role; permissions = [] }, list);
                                };
                                case (?permissions) {
                                    list := List.push<RelatedRP>({ role = role; permissions = permissions }, list);
                                };
                            };
                        };
                    };
                };
                return #ok(List.toArray<RelatedRP>(list));
            } else { return #err(#access_error) };
        };
        //User cleanup
        private func gc_client(user : User) {
            cert_delete(user);
            Map.delete(_list_users, phash, user);
            let arp : ArrayRelatedRP = user_rp(user);
            let lrp : ListRelatedRP = List.fromArray(arp);
            List.iterate<RelatedRP>(lrp, func v { update_list_roles_unbind(v.role) });
            Map.delete<User, Roles>(_associated_user_role, phash, user); //
        };
        //Role cleanup
        private func gc_role(role : Role) {
            Map.delete(_list_roles, thash, role);
            Map.delete(_associated_role_permission, thash, role); //
        };
        private func update_acting_clients(role : Role) {
            let vals : Iter.Iter<(Principal, (AuthClient, Nat))> = cert_entries();
            for ((p, (c, n)) in vals) {
                let arp = c.token.payload.arp;
                let lrp : ListRelatedRP = List.fromArray(arp);
                List.iterate<RelatedRP>(
                    lrp,
                    func rrp {
                        if (rrp.role == role) {
                            update_acting_client(c.token.payload.principal);
                        };
                    },
                );
            };
        };
        private func update_acting_client(user : User) {
            let client : ?AuthClient = cert_get(user);
            switch (client) {
                case (null) {};
                case (?client) {
                    let arrp : ArrayRelatedRP = user_rp(user : User);
                    let nac : AuthClient = reassemble_client(client, arrp);
                    ignore cert_replace(user, nac, Int.abs(nac.token.payload.exp));
                };
            };
        };
        private func reassemble_client(client : AuthClient, arp : ArrayRelatedRP) : AuthClient {
            let ac : AuthClient = {
                participant = client.participant;
                token = {
                    header = client.token.header;
                    payload = {
                        nbf = client.token.payload.nbf;
                        iat = client.token.payload.iat;
                        iss = client.token.payload.iss;
                        sub = client.token.payload.sub;
                        aud = client.token.payload.aud;
                        exp = client.token.payload.exp;
                        principal = client.token.payload.principal;
                        jti = client.token.payload.jti;
                        lrp = null;
                        arp = arp;
                    };
                };
            };
            ac;
        };
        //**Tokens; AuthClient**//
        private let jwt = JWT.JWT();
        private func create_token(caller : Principal, arp : ArrayRelatedRP) : Token {
            jwt.unsigned_token(Time.now() + exp, caller, arp);
        };
        private func create_client(caller : Principal, token : Token, self : () -> Principal) : async AuthClient {
            if (await is_controller(caller, self)) {
                let client : AuthClient = {
                    participant = #Admin;
                    token = token;
                };
                return client;
            };
            return { participant = #User; token = token };
        };
        private func new(caller : Principal, self : () -> Principal) : async AuthClient {
            let arp : ArrayRelatedRP = user_rp(caller);
            let token = create_token(caller, arp);
            let client : AuthClient = await create_client(caller, token, self);
            cert_save(caller, client, Int.abs(token.payload.exp));
            client;
        };
        private func valid_lifetime(client : AuthClient) : Bool {
            client.token.payload.exp >= Time.now();
        };
        public func auth_client(caller : Principal, self : () -> Principal) : async Result.Result<AuthClient, Errors> {
            let user : ?User = Map.get<User, User>(_list_users, phash, caller);
            switch (user) {
                case (null) { return #err(#invalid_caller) };
                case (?user) {
                    let client : ?AuthClient = cert_get(user);
                    switch (client) {
                        case (null) {
                            let client = await new(caller, self);
                            return #ok(client);
                        };
                        case (?client) {
                            if (valid_lifetime(client)) {
                                return #ok(client);
                            } else {
                                let client = await new(caller, self);
                                return #ok(client);
                            };
                        };
                    };
                };
            };
        };
        public func request_client(caller : Principal, self : () -> Principal) : async ?AuthClient {
            let user : ?User = Map.get<User, User>(_list_users, phash, caller);
            switch (user) {
                case (null) { return null };
                case (?user) {
                    let client : ?AuthClient = cert_get(user);
                    switch (client) {
                        case (null) {
                            let client = await new(caller, self);
                            return ?client;
                        };
                        case (?client) {
                            if (valid_lifetime(client)) {
                                return ?client;
                            } else {
                                let client = await new(caller, self);
                                return ?client;
                            };
                        };
                    };
                };
            };
        };
        public func delete_client(client : AuthClient, caller : Principal) : async Result.Result<Bool, Errors> {
            switch (controller(caller, client)) {
                case (#err(e)) { return #err(e) };
                case (#ok(v)) {
                    cert_delete(caller);
                    return #ok(true);
                };
            };
        };
        public func valid_client(caller : Principal) : async Bool {
            let client : ?AuthClient = cert_get(caller);
            switch (client) {
                case (null) { return false };
                case (?client) {
                    if (client.token.payload.exp > Time.now()) { return true } else {
                        return false;
                    };
                };
            };
            false;
        };
    };
};
