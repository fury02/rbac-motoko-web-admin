import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import List "mo:base/List";

import Lib "mo:rbac-motoko";

module {
    
    public type ListRelatedRP = Lib.ListRelatedRP;
    public type ArrayRelatedRP = Lib.ArrayRelatedRP;
    public type RelatedRP = Lib.RelatedRP;
    public type AuthClient = Lib.AuthClient;

    let role_read = "array_read";
    let permissions_read = "read";
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    //1
    //Check authClient and caller
    // Full verification includes:
    // -сhecking the caller on the server and the token for their identity
    // -verification of the stored token for the caller and the issued roles n in compliance
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
    //2
    //Check authClient
    // Verification includes:
    // -verification of the stored token for the caller and the issued roles n in compliance
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
    //3
    //Non Check backend. Check in web app.
    //Checking in the WEB application for compliance with the assigned roles
    public func indisputable_read_array() : async [Nat] {
        return array;
    };
};
