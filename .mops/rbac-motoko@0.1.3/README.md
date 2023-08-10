# Role-Based Authentication Class - Motoko

### Examine
- Web administrator source https://github.com/fury02/rbac-motoko-web-admin
- All information with examples, source code can be found in the web application https://gyuwx-hqaaa-aaaan-qdw2a-cai.icp0.io/

### Check system requirements
- [Node.js](https://nodejs.org/)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/quickstart/local-quickstart) >= 0.14.3
- [Moc](https://github.com/dfinity/motoko/releases) >= 0.9.3

### Setup MOPS
Configure this package manager
Follow the instructions
- https://mops.one/docs/install

 ```
 "defaults": {
    "build": {
      "args": "",
      "packtool": "mops sources"
    }
  }
  ```

#### Add the following lines

 ```
[dependencies]
rbac-motoko = "0.1.3"
 ```
### About project
The Role-Based Authentication Class is a classic implementation of this model. In this implementation, RBAC is closely integrated with access tokens (JWT). The tokens themselves are wrapped in an authenticated client, which also contains information about the client's privilege (User; Admin)
Use cases:
The first option. You can integrate the library directly into your project (Internet Computer canister). As it is shown in the web application https://github.com/fury02/rbac-motoko-web-admin . As a result, you will have a WEB application (WEB: Administrator RBAC) and a Backend: your code plus a library
The second option. You can use a three-tier architecture.
In this variant, the RBAC canister will act as a service for issuing certified customers.

####  That is, you will have:
- WEB: Administrator RBAC
- Backend: RBAC
- Backend: Your code
####  Or another option
- WEB: Administrator RBAC
- Backend: RBAC
- WEB: Your WEB.

### AuthClient example (access token)
Example of a auth-client. According to the JWL standard (https://datatracker.ietf.org/doc/html/rfc7519 ).
With a slight modification.
```
variant {
    ok = record {
      token = record {
        payload = record {
          arp = vec {
            record { permissions = vec { "read" }; role = "array_read" };
            record {
              permissions = vec { "delete"; "put"; "read" };
              role = "array_full";
            };
          };
          aud = "";
          exp = 1_692_095_096_758_625_067 : int;
          iat = "";
          iss = "";
          jti = "oIil5JVWiMJ135DkXH7PYZI9FFL";
          lrp = null;
          nbf = "";
          sub = "";
          "principal" = principal "mlx7d-nlzwm-jsiyr-txxc2-mlgsf-hafo6-73wnd-du4xx-f2tsd-mjtum-pae";
        };
        header = record { alg = variant { NONE }; typ = variant { UJWT } };
      };
      participant = variant { Admin };
    }
  }
  ```
Some information
- arp: roles and permissions;
- exp: token validity period. absolute value;
- jti: random value;
- participant: administrator or user;

### Call diagram:

#### Interaction: Rbac - Canister
```mermaid
sequenceDiagram
    participant canister as Canister;
    participant rbac as Role_Based_Authentication_Class; 
    participant controller as Controller(module);
    participant scanner as Service_worker(module);
    Note over canister, controller: Caller not found
    alt Caller not found
        canister->>rbac: REQUEST (request_client, auth_client)
        rbac->>controller:  caller_verification
    
        controller->>rbac:  err(e)
        rbac->>canister: RESPONSE 
    Note over canister, controller: Caller found
    else Caller found
        canister->>rbac: REQUEST (request_client, auth_client)
        rbac->>controller:  caller_verification  
        controller->>rbac:  ok(token)
        rbac->>scanner: command: start
        loop Service
             
            %% par Notifications
                %% scanner->>scanner: Periodically checks active clients  for the token lifetime
                %% Note over canister, scanner: OPTIONS
                %% scanner--)canister: NOTIFY
                %% Note over scanner, scanner
                %% scanner->>scanner: Stop scanner if not active clients 
            %% end

             scanner->>scanner: Removal of isolated tokens upon expiration
        end
        rbac->>canister: RESPONSE
    end
   ```

[//]: # (![image]&#40;doc/mermaid_diagram/canister.svg&#41;)
#### Interaction: Rbac - Web
```mermaid
 sequenceDiagram
    participant web as Web_canister;
    participant rbac as Role_Based_Authentication_Class; 
    participant controller as Controller(module);
    participant scanner as Service_worker(module);

    Note over web, controller: Caller not found
    alt Caller not found
        web->>rbac: REQUEST (request_client, auth_client)
        rbac->>controller:  caller_verification
    
        controller->>rbac:  err(e)
        rbac->>web: RESPONSE 
    Note over web, controller: Caller found
    else Caller found
        web->>rbac: REQUEST (request_client, auth_client)
        rbac->>controller:  caller_verification
    
        controller->>rbac:  ok(token)

        rbac->>scanner: command: start
        loop Service
            %% scanner->>scanner: Periodically checks active clients  for the token lifetime
            %% scanner->>scanner: Stop scanner if not active clients 
            %% par Notifications
                %% Note over web, scanner: OPTIONS
                %% scanner--)web: NOTIFY
            %% end
             scanner->>scanner: Removal of isolated tokens upon expiration
        end
        
        rbac->>web: RESPONSE
    end
   ```

### Sample template
```motoko 
    import { WEEK; DAY; HOUR; MINUTE; SECOND } "mo:time-consts";
    import Map "mo:map/Map";
    import CertifiedCache "mo:certified-cache";
    import { JSON; Candid } "mo:serde";
    import Lib "mo:rbac-motoko";  
```

```motoko  
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
    
};
```
### Sample access restrictions
```motoko 
import Lib "mo:rbac-motoko";
```

```motoko  
public type ListRelatedRP = Lib.ListRelatedRP;
public type ArrayRelatedRP = Lib.ArrayRelatedRP;
public type RelatedRP = Lib.RelatedRP;
public type AuthClient = Lib.AuthClient;


let role_read = "array_read";
let permissions_read = "read";

let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
```

```motoko  
    public func read_array(lib: Lib.lib_rbac, caller: Principal, client : AuthClient) : async [Nat] {
        var access = false;
        switch (lib.controller(caller, client)) {
            case (#err(e)) { return [] };
            case (#ok(v)) {
                let arp : ArrayRelatedRP = lib.user_rp(caller);
                let lrp : ListRelatedRP = List.fromArray(arp);
                List.iterate<RelatedRP>(
                    lrp,
                    func rrp {
                        if (rrp.role == role_read) {
                            access := true;
                        };
                    },
                );
                if (access) {
                    return array;
                } else {
                    return [];
                };
            };
        };
    };

    public func anonymous_read_array(lib: Lib.lib_rbac, client : AuthClient) : async [Nat] {
        var access = false;
        let arp : ArrayRelatedRP = lib.user_rp(client.token.payload.principal);
        let lrp : ListRelatedRP = List.fromArray(arp);
        List.iterate<RelatedRP>(
            lrp,
            func rrp {
                if (rrp.role == role_read) {
                    access := true;
                };
            },
        );
        if (access) {
            return array;
        } else {
            return [];
        };
        return array;
    };
```

## Lib
[rbac-motoko]
#### Last version:
- Version: 0.1.3

#### Dependencies:
  - base = "0.9.6"
  - map = "8.1.0"
  - time-consts = "1.0.1"
  - fuzz = "0.1.0"
  - certified-cache = "0.2.0"
  - serde = "1.0.2"

[//]: # (## In  future)

## License

MIT License

Copyright (c) 2023 fury02

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Funding
The bounty was funded by The ICDevs.org community and the DFINITY Foundation 