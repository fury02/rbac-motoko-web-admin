import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Nat64 "mo:base/Nat64";
import List "mo:base/List";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Array "mo:base/Array";
module {
    public type Admin = Principal;
    public type Admins = [Admin];
    public type User = Principal;
    public type Users = [User];
    public type Role = Text;
    public type Roles = [Role];
    public type Permission = Text;
    public type Permissions = [Permission];
    public type CountRef = Nat; //number of links used
    public type JTI = Text;
    public type ListRelatedRP = List.List<RelatedRP>;
    public type ArrayRelatedRP = [RelatedRP];
    public type Duration = Timer.Duration;
    public type Scanner = { #ON; #OFF };
    public type SETTINGS_TIME = {
        exp_regarding : Nat;
        type_time : Nat;
    };
    public type ObjectRP = {
        name : Text;
        count_ref: CountRef; //role or permissions
        timestamp_change: Time.Time;
        variant_change: VariantChange;
    };
    public type VariantChange = {
        #Created;
        #Bind;
        #Unbind;
    };
    public type RelatedRP = {
        role : Role; 
        permissions : Permissions
    };
    public type Participant = {
        #User;
        #Admin;
    };
    public type AuthClient = {
        participant : Participant;
        token : Token;
    };
    //jwt (https://datatracker.ietf.org/doc/html/rfc7519)
    public type Alg = { 
        #NONE; //6.1.unsecured jwt
    };
    public type TypeToken = {
        #JWT; //only "jwt"
        #UJWT; //or "ujwt" unsigned
    };
    public type Token = {
        header : Header;
        payload : Payload;
    };
    public type Header = {
        typ : TypeToken;
        alg : Alg;
    };
    public type Payload = {
        nbf : Text;
        iat : Text;
        iss : Text; //issuer
        sub : Text; //subject
        aud : Text; //audience
        exp : Int; //expire time token created
        principal : Principal;
        jti : JTI; //jwt id
        lrp : ?ListRelatedRP;
        arp : ArrayRelatedRP;
    };
    public type Errors = {
        #invalid_token;
        #invalid_client;
        #invalid_caller;
        #access_error;
        #contain;
        #not_contain;
        #error_delete;
        #error_add;
        #unbind_failed;
        #bind_failed;
    };
    public type canister_id = Principal;
    public type canister_settings = {
        controllers : ?[Principal];
        compute_allocation : ?Nat;
        memory_allocation : ?Nat;
        freezing_threshold : ?Nat;
    };
    public type definite_canister_settings = {
        controllers : [Principal];
        compute_allocation : Nat;
        memory_allocation : Nat;
        freezing_threshold : Nat;
    };
    public type from_user = {
        user_id : Principal;
    };
    public type from_canister = {
        canister_id : Principal;
        canister_version : ?Nat64;
    };
    public type change_origin = {
        #from_user : {
            user_id : Principal;
        };
        #from_canister : {
            canister_id : Principal;
            canister_version : ?Nat64;
        };
    };
    public type change_details = {
        #creation : {
            controllers : [Principal];
        };
        #code_uninstall;
        #code_deployment : {
            mode : { #install; #reinstall; #upgrade };
            module_hash : Blob;
        };
        #controllers_change : {
            controllers : [Principal];
        };
    };
    public type change = {
        timestamp_nanos : Nat64;
        canister_version : Nat64;
        origin : change_origin;
        details : change_details;
    };
    public type http_header = {
        name : Text;
        value : Text;
    };
    public type http_response = {
        status : Nat16;
        headers : [http_header];
        body : Blob;
    };
    public type ecdsa_curve = { #secp256k1 };
};
